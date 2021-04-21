import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { MovementType } from './movement-type.entity';

import { MovementTypesService } from './movement-types.service';
import { MovementTypesResolver } from './movement-types.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MovementType])],
  providers: [MovementTypesService, MovementTypesResolver],
  exports: [MovementTypesService],
})
export class MovementTypesModule {}
