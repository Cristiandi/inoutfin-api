import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetMovementTypeByOneFieldInput {
  @IsString()
  @Field(() => String)
  readonly field: string;

  @IsString()
  @Field(() => String)
  readonly value: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  readonly checkExisting?: boolean;
}
