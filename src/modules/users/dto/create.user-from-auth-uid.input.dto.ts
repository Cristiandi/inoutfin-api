import { Field, InputType } from '@nestjs/graphql';
import { Length, IsString, IsOptional, IsEmail } from 'class-validator';

@InputType()
export class CreateUserFromAuthUidInput {
  @IsString()
  @Field(() => String)
  readonly authUid: string;

  @IsEmail()
  @Field(() => String)
  readonly email: string;

  @Length(5, 160)
  @IsString()
  @Field(() => String, { nullable: true })
  readonly fullName?: string;

  @IsOptional()
  @Length(10)
  @IsString()
  @Field(() => String, { nullable: true })
  readonly phone?: string;
}