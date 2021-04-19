import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
// import { CustomExceptionFilter } from './common/filters/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // getting the config service
  const configService = app.get(ConfigService);

  // using the filters
  // app.useGlobalFilters(new CustomExceptionFilter());

  // getting the port env var
  const PORT = configService.get<number>('config.app.port');

  const ENV = configService.get<string>('config.environment');

  await app.listen(PORT, () => {
    Logger.log(`app listening at ${PORT} in ${ENV}`, 'main.ts');
  });
}
bootstrap();
