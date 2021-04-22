import { Module } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { BalancesResolver } from './balances.resolver';

@Module({
  providers: [BalancesService, BalancesResolver],
})
export class BalancesModule {}
