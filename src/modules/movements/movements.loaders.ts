import * as DataLoader from 'dataloader';

import { Injectable, Scope } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { MovementTypesService } from '../movement-types/movement-types.service';
import { MovementCategoriesService } from '../movement-categories/movement-categories.service';

@Injectable({ scope: Scope.REQUEST })
export class MovementsLoaders {
  constructor(
    private usersService: UsersService,
    private movementTypesService: MovementTypesService,
    private movementCategoriesService: MovementCategoriesService,
  ) {}

  public readonly batchUsers = new DataLoader(async (masterIds: number[]) => {
    const masters = await this.usersService.getByIds(masterIds);
    const mastersMap = new Map(masters.map((item) => [item.id, item]));
    return masterIds.map((masterId) => mastersMap.get(masterId));
  });

  public readonly batchMovementTypes = new DataLoader(
    async (masterIds: number[]) => {
      const masters = await this.movementTypesService.getByIds(masterIds);
      const mastersMap = new Map(masters.map((item) => [item.id, item]));
      return masterIds.map((masterId) => mastersMap.get(masterId));
    },
  );

  public readonly batchMovementCategories = new DataLoader(
    async (masterIds: number[]) => {
      const masters = await this.movementCategoriesService.getByIds(masterIds);
      const mastersMap = new Map(masters.map((item) => [item.id, item]));
      return masterIds.map((masterId) => mastersMap.get(masterId));
    },
  );
}
