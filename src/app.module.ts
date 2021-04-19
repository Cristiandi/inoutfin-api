import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from './config/app.config';
import appConfigSchema from './config/app.config.schema';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';

const NODE_ENV = process.env.NODE_ENV || 'local';
const envPath = path.resolve(__dirname, `../.env.${NODE_ENV}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envPath,
      load: [appConfig],
      validationSchema: appConfigSchema,
    }),

    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      playground: true,
      introspection: true,
      installSubscriptionHandlers: true,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
