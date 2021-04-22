import { Resolver } from '@nestjs/graphql';

import { BalancesService } from './balances.service';

@Resolver()
export class BalancesResolver {
  constructor(private readonly service: BalancesService) {}
}
