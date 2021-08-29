import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import appConfig from '../../../config/app.config';

import { BasicAclService } from './basic-acl.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig), HttpModule],
  providers: [BasicAclService],
  exports: [BasicAclService],
})
export class BasicAclModule {}
