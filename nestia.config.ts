import { INestiaConfig } from '@nestia/sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(AppModule);
    return app;
  },
  output: 'src/api',
  simulate: true,
  distribute: 'packages/api',
  propagate: true,
  e2e: 'test',
};
export default NESTIA_CONFIG;
