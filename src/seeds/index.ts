import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from '../app.module';

import { SeedMovementTypesFactory } from './seed_movement_types';

(async () => {
  // getting the nest js app
  const application = await NestFactory.createApplicationContext(AppModule);

  Logger.log('INIT --MOVEMENT TYPES--', 'index.ts');

  await SeedMovementTypesFactory.seed(application);

  Logger.log('END --MOVEMENT TYPES--', 'index.ts');
})()
  .catch((err) => console.error(err))
  .finally(() => process.exit(0));
