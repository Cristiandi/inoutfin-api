// TODO: basic-acl-sdk
import * as path from 'path';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';

import appConfig from './config/app.config';
import appConfigSchema from './config/app.config.schema';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { MovementTypesModule } from './modules/movement-types/movement-types.module';
import { MovementCategoriesModule } from './modules/movement-categories/movement-categories.module';
import { MovementsModule } from './modules/movements/movements.module';

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
      formatError: (error) => {
        console.error(error);
        return error;
      },
      resolvers: { Upload: GraphQLUpload }, // NOTE : Adding this adjustment solved my issue
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
        logging: false,
      }),
    }),

    UsersModule,

    CommonModule,

    MovementTypesModule,

    MovementCategoriesModule,

    MovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
