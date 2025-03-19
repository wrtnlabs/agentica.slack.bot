import { Agentica } from '@agentica/core';
import dotenv from 'dotenv';
import * as readline from 'readline';
import { createAgent } from '../../src/agents';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

// 문장을 입력받는 부분
const askQuestion = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function main(agent: Agentica<'chatgpt'>) {
  let input = '';
  while (true) {
    input = await askQuestion('문장을 입력하세요 (줄바꿈은 Shift+Enter로 가능, 종료하려면 Ctrl+C): ');
    const inputBuffer = input + '\n'; // 줄바꿈과 함께 입력 내용 누적
    // LLM 답변
    const histories = await agent.conversate(inputBuffer);
    histories.forEach((history) => {
      console.log(history.toJSON());
    });
  }
}

main(createAgent([])).catch(console.error);
