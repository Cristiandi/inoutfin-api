import { INestApplicationContext, Logger } from '@nestjs/common';

import { MovementCategoriesService } from '../modules/movement-categories/movement-categories.service';

const rows = [
  {
    name: 'Fijo',
    code: '01GF',
    description: 'Gastos que se tienen que pagar si o sí.',
    sign: -1,
  },
  {
    name: 'Emergencia',
    code: '02GE',
    description: 'Gastos excepcionales.',
    sign: -1,
  },
  {
    name: 'Ahorro',
    code: '03GA',
    description: 'Gastos en pro de invertir de cara a un futuro.',
    sign: -1,
  },
  {
    name: 'Ocio',
    code: '04GO',
    description: 'Gastos enfocados en el placer.',
    sign: -1,
  },
  {
    name: 'Fijo',
    code: '05IF',
    description: 'Ingresos que llegan si o sí.',
    sign: 1,
  },
  {
    name: 'Ocasional',
    code: '06IO',
    description: 'Ingresos que pueden o no llegar.',
    sign: 1,
  },
];

export const SeedMovementCategoriesFactory = {
  seed: async (application: INestApplicationContext) => {
    const service = application.get(MovementCategoriesService);

    for (const row of rows) {
      const existing = await service.getByOneField({
        field: 'code',
        value: row.code,
      });

      if (!existing) {
        Logger.log('creating...', 'SeedMovementCategoriesFactory');

        await service.create({
          code: row.code,
          name: row.name,
          description: row.description,
          sign: row.sign,
        });
      } else {
        Logger.log('updating...', 'SeedMovementCategoriesFactory');

        await service.update(
          {
            id: existing.id,
          },
          {
            code: row.code,
            name: row.name,
            description: row.description,
            sign: row.sign,
          },
        );
      }
    }
  },
};
