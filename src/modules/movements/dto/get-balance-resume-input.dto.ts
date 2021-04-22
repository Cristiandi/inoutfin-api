import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class GetBalanceResumeInput {
  @IsString()
  @Field(() => String)
  readonly userAuthUid: string;
}
