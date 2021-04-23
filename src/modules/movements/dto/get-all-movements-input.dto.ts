import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetAllMovementsInput {
  @IsString()
  @Field(() => String)
  readonly userAuthUid: string;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  readonly limit?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  readonly skip?: number;
}
