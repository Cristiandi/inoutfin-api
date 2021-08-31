import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';

import { User } from './user.entity';

import { UsersService } from './users.service';

import { Public } from '../../common/decorators/public.decorator';
import { AclSlug } from '../../common/decorators/acl-slug.decorator';

import { CreateUserInput } from './dto/create-user-input';
import { GetUserByAuthUidInput } from './dto/get-uset-by-auth-uid-input.dto';
import { ResetUserPasswordInput } from './dto/reset-user-password-input.dto';
import { UpdateUserInput } from './dto/update-user-input.dto';
import { ChangeUserEmailInput } from './dto/change-user-email-input.dto';
import { ChangeUserPasswordInput } from './dto/change-user-password-input.dto';
import { ChangeUserPhoneInput } from './dto/change-user-phone-input.dto';
import { CreateUserFromAuthUidInput } from './dto/create.user-from-auth-uid.input.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly service: UsersService) {}

  @Public()
  @Mutation(() => User, { name: 'createUser' })
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.service.create(createUserInput);
  }

  @Public()
  @Mutation(() => User, { name: 'createUserFromAuthUid' })
  createUserFromAuthUid(
    @Args('createUserFromAuthUidInput') createUserFromAuthUidInput: CreateUserFromAuthUidInput
  ): Promise<User> {
    return this.service.createFromAuthUid(createUserFromAuthUidInput);
  }

  @AclSlug('users:handle')
  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.service.update(updateUserInput);
  }

  @AclSlug('users:handle')
  @Mutation(() => User, { name: 'changeUserEmail' })
  changeUserEmail(
    @Args('changeUserEmailInput') changeUserEmailInput: ChangeUserEmailInput,
  ): Promise<User> {
    return this.service.changeEmail(changeUserEmailInput);
  }

  @AclSlug('users:handle')
  @Mutation(() => User, { name: 'changeUserPassword' })
  changeUserPassword(
    @Args('changeUserPasswordInput')
    changeUserPasswordInput: ChangeUserPasswordInput,
  ): Promise<User> {
    return this.service.changePassword(changeUserPasswordInput);
  }

  @AclSlug('users:handle')
  @Mutation(() => User, { name: 'changeUserPhone' })
  changeUserPhone(
    @Args('changeUserPhoneInput') changeUserPhoneInput: ChangeUserPhoneInput,
  ): Promise<User> {
    return this.service.changePhone(changeUserPhoneInput);
  }

  @AclSlug('users:read')
  @Query(() => User, { name: 'getUserByAuthUid' })
  getUserByAuthUid(
    @Args('getUserByAuthUidInput') getUserByAuthUidInput: GetUserByAuthUidInput,
  ): Promise<User> {
    return this.service.getByAuthuid(getUserByAuthUidInput);
  }

  @AclSlug('users:handle')
  @Mutation(() => String, { name: 'resetUserPassword' })
  resetUserPassword(
    @Args('resetUserPasswordInput')
    resetUserPasswordInput: ResetUserPasswordInput,
  ): Promise<string> {
    return this.service.resetPassword(resetUserPasswordInput);
  }
}
