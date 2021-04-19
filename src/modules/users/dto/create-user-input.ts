import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, Length } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Length(5, 160)
  @IsString()
  @Field(() => String)
  readonly fullName: string;

  @IsEmail()
  @Field(() => String)
  readonly email: string;

  @Length(10)
  @IsString()
  @Field(() => String)
  readonly phone: string;

  @Length(6, 16)
  @IsString()
  @Field(() => String)
  readonly password: string;
}
