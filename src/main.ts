import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // getting the config service
  const configService = app.get(ConfigService);

  // using the filters
  // app.useGlobalFilters(new CustomExceptionFilter());

  // getting the port env var
  const PORT = configService.get<number>('config.app.port' as never);

  const ENV = configService.get<string>('config.environment' as never);

  await app.listen(PORT, () => {
    Logger.log(`app listening at ${PORT} in ${ENV}`, 'main.ts');
  });
}
bootstrap();
