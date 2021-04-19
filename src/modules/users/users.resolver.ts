import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';

import { User } from './user.entity';

import { UsersService } from './users.service';

import { CreateUserInput } from './dto/create-user-input';
import { GetUserByAuthUidInput } from './dto/get-uset-by-auth-uid-input.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly service: UsersService) {}

  @Mutation(() => User, { name: 'createUser' })
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.service.create(createUserInput);
  }

  @Query(() => User, { name: 'getUserByAuthUid' })
  getUserByAuthUid(
    @Args('getUserByAuthUidInput') getUserByAuthUidInput: GetUserByAuthUidInput,
  ) {
    return this.service.getByAuthuid(getUserByAuthUidInput);
  }
}
