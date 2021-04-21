import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class ChangeUserPasswordInput {
  @IsString()
  @Field(() => String)
  readonly authUid: string;

  @Length(6, 16)
  @IsString()
  @Field(() => String)
  readonly oldPassword: string;

  @Length(6, 16)
  @IsString()
  @Field(() => String)
  readonly newPassword: string;
}
