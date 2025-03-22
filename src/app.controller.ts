import { Agentica } from '@agentica/core';
import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GithubService } from '@wrtnlabs/connector-github';
import { KakaoMapService } from '@wrtnlabs/connector-kakao-map';
import { SlackService } from '@wrtnlabs/connector-slack';
import OpenAI from 'openai';
import typia from 'typia';
import { ISlack } from './api/structures/ISlack';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly openai: OpenAI;
  private readonly slackService: SlackService;
  // Lock to prevent concurrent processing of the same thread
  private readonly threadLock: Map<string, boolean> = new Map();

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });
    const slackAccessToken = this.configService.get<string>('SLACK_ACCESS_TOKEN')!;
    this.slackService = new SlackService({ secretKey: slackAccessToken });
  }

  @Post('interactivity')
  async handleInteractivity(@Body() body: ISlack.IInteractivityInput): Promise<string | void> {
    // Handle URL verification challenge from Slack
    if (body.type === 'url_verification') {
      return body.challenge;
    }

    const event = body.event;

    // Only process app_mention events
    if (event.type !== 'app_mention') {
      return;
    }

    // Retrieve bot information and its user ID
    const botInfo = await this.slackService.getMyInfo();
    const botId = botInfo.user.user_id;

    // If the bot is not mentioned explicitly, exit early
    if (!event.text?.includes(`<@${botId}>`)) {
      return;
    }

    // Prevent the bot from responding to its own messages
    if (event.user === botId) {
      return;
    }

    // Check if this thread is already being processed
    if (this.threadLock.get(event.thread_ts)) {
      return;
    }

    try {
      // Lock the current thread to prevent concurrent processing
      this.threadLock.set(event.thread_ts, true);
      const threadOption = { channel: event.channel, ts: event.thread_ts };
      const { replies, members } = await this.slackService.getReplies(threadOption);

      // If the last reply was sent by the bot, there's no need to respond again
      const lastReply = replies[replies.length - 1];
      if (lastReply?.user === botId) {
        console.error('Last reply was sent by the bot. No response required.');
        return;
      }

      // Create an Agentica instance with conversation history based on thread replies
      const histories = replies.map((reply) => {
        const isBot = reply.user === botId;
        return {
          role: isBot ? 'assistant' : 'user',
          text: isBot ? reply.text : JSON.stringify({ user: reply.user, username: reply.username, text: reply.text }),
          type: 'text',
        } as const;
      });

      const agent = new Agentica({
        model: 'chatgpt',
        vendor: {
          api: this.openai,
          model: 'gpt-4o-mini',
        },
        histories: histories.slice(0, -1), // I exclude the words at the last point because they are probably from an event.
        controllers: [
          // Put in the controllers you want
          {
            name: 'Github Connector for Organization',
            protocol: 'class',
            application: typia.llm.application<
              Pick<GithubService, 'getReadmeFile' | 'fetchRepositoryIssues' | 'getIssueDetail' | 'getIssueComments'>,
              'chatgpt'
            >(),
            execute: new GithubService({ secret: this.configService.get<string>('GITHUB_ACCESS_TOKEN')! }),
          },
          {
            name: 'Kakao-map Connector for Organization',
            protocol: 'class',
            application: typia.llm.application<KakaoMapService, 'chatgpt'>(),
            execute: new KakaoMapService({ clientId: this.configService.get<string>('KAKAO_CLIENT_ID')! }),
          },
        ],
        config: {
          systemPrompt: {
            initialize: () =>
              [
                'You are a helpful assistant.',
                'Use the supplied tools to assist the user.',
                '',
                `You are ${botInfo.user.name}, the assistant for team.`, // THIS IS IMPORTANT!
                'This conversation is taking place in Slack.',
                'You respond when mentioned via app_mention.',
                'The user in this conversation has the following information:',
                JSON.stringify(members),
              ].join('\n'),
          },
        },
      });

      // Generate a response using Agentica
      const response = await agent.conversate(histories.at(-1)!.text);

      // Filter and extract text responses
      const answers = response.filter((item) => 'text' in item).map((item) => item.text);
      const lastAnswer = answers.pop();

      // Send the final response back to Slack if available
      if (lastAnswer) {
        await this.slackService.sendReply({ ...threadOption, text: lastAnswer });
      }
    } catch (error) {
      console.error(error);
    } finally {
      // Release the lock after a short delay
      setTimeout(() => this.threadLock.set(event.thread_ts, false), 1000);
    }
  }
}
