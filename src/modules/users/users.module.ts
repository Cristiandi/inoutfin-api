import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

import { User } from './user.entity';

import { BasicAclModule } from '../../common/plugins/basic-acl/basic-acl.module';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([User]),
    BasicAclModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
