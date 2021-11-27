import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BasicAclModule } from 'nestjs-basic-acl-sdk';

import appConfig from '../../config/app.config';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

import { User } from './user.entity';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    BasicAclModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          companyUid: configService.get<string>('config.acl.companyUid'),
          accessKey: configService.get<string>('config.acl.accessKey'),
        };
      }
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
