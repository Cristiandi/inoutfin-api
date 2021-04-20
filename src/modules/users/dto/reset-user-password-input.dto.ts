import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class ResetUserPasswordInput {
  @IsEmail()
  @Field(() => String)
  readonly email: string;
}
