import { InputType, PartialType } from '@nestjs/graphql';
import { CreateMovementCategoryInput } from './create-movement-category-input.dto';

@InputType()
export class UpdateMovementCategoryInput extends PartialType(
  CreateMovementCategoryInput,
) {}
