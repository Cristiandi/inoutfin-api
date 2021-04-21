import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class ChangeUserEmailInput {
  @IsString()
  @Field(() => String)
  readonly authUid: string;

  @IsEmail()
  @Field(() => String)
  readonly email: string;
}
