import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthCheckController } from './health-check.controller';

@Module({
  imports: [ConfigModule.forRoot(), CacheModule.register()],
  controllers: [AppController, HealthCheckController],
  providers: [AppService],
})
export class AppModule {}
