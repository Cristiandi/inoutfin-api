import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from '../app.module';

import { SeedMovementTypesFactory } from './seed_movement_types';
import { SeedMovementCategoriesFactory } from './seed_movement_categories';

(async () => {
  // getting the nest js app
  const application = await NestFactory.createApplicationContext(AppModule);

  Logger.log('INIT --MOVEMENT TYPES--', 'index.ts');

  await SeedMovementTypesFactory.seed(application);

  Logger.log('END --MOVEMENT TYPES--', 'index.ts');

  Logger.log('INIT --MOVEMENT CATEGORIES--', 'index.ts');

  await SeedMovementCategoriesFactory.seed(application);

  Logger.log('END --MOVEMENT CATEGORIES--', 'index.ts');
})()
  .catch((err) => console.error(err))
  .finally(() => process.exit(0));
