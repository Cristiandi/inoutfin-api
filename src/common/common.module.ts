import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import appConfig from '../config/app.config';

import { AuthorizationGuard } from './guards/authorization.guard';

import { BasicAclModule } from './plugins/basic-acl/basic-acl.module';

// import { LoggingMiddleware } from './middlewares/logging.middleware';
@Module({
  imports: [ConfigModule.forFeature(appConfig), BasicAclModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class CommonModule {}
