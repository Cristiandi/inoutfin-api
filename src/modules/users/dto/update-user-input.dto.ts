import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @IsString()
  @Field(() => String)
  readonly authUid: string;

  @Length(5)
  @IsString()
  @Field(() => String)
  readonly fullName: string;
}
