import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovementsService } from './movements.service';
import { MovementsResolver } from './movements.resolver';
import { MovementsLoaders } from './movements.loaders';

import { Movement } from './movement.entity';

import { UsersModule } from '../users/users.module';
import { MovementTypesModule } from '../movement-types/movement-types.module';
import { MovementCategoriesModule } from '../movement-categories/movement-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movement]),
    UsersModule,
    MovementTypesModule,
    MovementCategoriesModule,
  ],
  providers: [MovementsService, MovementsLoaders, MovementsResolver],
})
export class MovementsModule {}
