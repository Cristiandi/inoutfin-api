import { InputType, PartialType } from '@nestjs/graphql';
import { CreateMovementTypeInput } from './create-movement-type-input.dto';

@InputType()
export class UpdateMovementTypeInput extends PartialType(
  CreateMovementTypeInput,
) {}
