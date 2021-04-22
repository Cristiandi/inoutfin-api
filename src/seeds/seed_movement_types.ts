import { INestApplicationContext, Logger } from '@nestjs/common';

import { MovementTypesService } from '../modules/movement-types/movement-types.service';

const rows = [
  {
    name: 'Income',
    code: '01I',
    sign: 1,
  },
  {
    name: 'Outcome',
    code: '02O',
    sign: -1,
  },
];

export const SeedMovementTypesFactory = {
  seed: async (application: INestApplicationContext) => {
    const service = application.get(MovementTypesService);

    for (const row of rows) {
      const existing = await service.getByOneField({
        field: 'code',
        value: row.code,
      });

      if (!existing) {
        Logger.log('creating...', 'SeedMovementTypesFactory');

        await service.create({
          code: row.code,
          name: row.name,
          sign: row.sign,
        });
      } else {
        Logger.log('updating...', 'SeedMovementTypesFactory');

        await service.update(
          {
            id: existing.id,
          },
          {
            code: row.code,
            name: row.name,
            sign: row.sign,
          },
        );
      }
    }
  },
};
