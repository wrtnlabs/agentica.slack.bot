# Slack Agent using Agentica

## Overview

This project implements a Slack Agent powered by **Agentica** and **OpenAI's GPT model**. The agent listens for messages in Slack that mention the app and responds automatically. It processes incoming interactivity events from Slack, extracts conversation history, and generates intelligent replies using GPT. This solution is ideal for automating responses and engaging in dynamic conversations on Slack.

## Features

- **Automatic Response to Mentions:** The agent listens for `app_mention` events and responds only when explicitly mentioned.
- **Conversation History Integration:** It gathers previous thread messages to build context and provide coherent replies.
- **GPT-Powered Replies:** Leveraging OpenAI's GPT model, the agent generates natural language responses.
- **Thread Locking:** Ensures that concurrent messages in the same thread are processed sequentially.
- **Type Safety:** Uses `typia` for enhanced type safety and reliable code execution.
- **Secure Credential Management:** Utilizes `dotenv` to securely manage sensitive API keys and tokens.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/slack-agent.git
   cd slack-agent
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   This project depends on:

   - `@agentica/core`
   - `@wrtnlabs/connector-slack`
   - `dotenv`
   - `openai`
   - `typia`
   - Other NestJS dependencies

## Setup

1. **Configure Environment Variables**

   Create a `.env` file in the project root with the following variables:

   ```env
   OPENAI_API_KEY=your-openai-api-key
   SLACK_ACCESS_TOKEN=your-slack-secret-key
   ```

2. **Slack API Configuration**

   - Go to the [Slack API: Applications](https://api.slack.com/apps) page and create a new Slack App.
   - Configure the necessary scopes for your app. The recommended scopes to use all functions are:
     - `channels:read`
     - `channels:history`
     - `users.profile:read`
     - `im:read`
     - `groups:read`
     - `chat:write`
     - `users:read`
     - `usergroups:read`
     - `files:read`
     - `team:read`
   - Install the app to your Slack workspace and note the **Secret Key** (which you will reference as `SLACK_ACCESS_TOKEN`).

## Running the Service

Start the application using your preferred method. For example, if you're using NestJS:

```bash
npm run start
```

The application will listen for interactivity events from Slack. When your app is mentioned in a Slack message, it will generate a reply based on the conversation context and send the response back to the thread.

## How It Works

1. **Event Handling:**  
   The agent receives interactivity events from Slack. It specifically handles URL verification and `app_mention` events.

2. **Processing Messages:**  
   For an `app_mention` event, the agent checks that:

   - The bot is mentioned in the message.
   - The message is not from the bot itself.
   - The thread is not already being processed.

3. **Conversation Context:**  
   It retrieves the conversation history from the thread, maps the replies into a format that Agentica can use, and generates a coherent reply with OpenAI's GPT model.

4. **Replying:**  
   Finally, the agent sends the generated reply back to the Slack thread.

## Security Note

**Warning:**  
This code is provided for demonstration purposes only. Using automated file or message operations can be risky in a production environment. **Do not use this code in production without proper security measures.** Always ensure that your credentials are secured and that your app is thoroughly tested before deployment.

## License

[MIT License](LICENSE)

---

Feel free to open issues or contribute to the project if you encounter any bugs or have feature requests. Enjoy automating your Slack interactions with Agentica!
