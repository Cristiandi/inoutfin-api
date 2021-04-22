import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovementCategory } from './movement-category.entity';

import { MovementCategoriesService } from './movement-categories.service';
import { MovementCategoriesResolver } from './movement-categories.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MovementCategory])],
  providers: [MovementCategoriesService, MovementCategoriesResolver],
  exports: [MovementCategoriesService],
})
export class MovementCategoriesModule {}
