import {
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../config/app.config';

import { User } from './user.entity';

import { BasicAclService } from '../../common/plugins/basic-acl/basic-acl.service';

import { CreateUserInput } from './dto/create-user-input';
import { GetUserByOneFieldInput } from './dto/get-user-by-one-field-input.dto';
import { GetUserByAuthUidInput } from './dto/get-uset-by-auth-uid-input.dto';
import { ResetUserPasswordInput } from './dto/reset-user-password-input.dto';
import { UpdateUserInput } from './dto/update-user-input.dto';
import { ChangeUserEmailInput } from './dto/change-user-email-input.dto';
import { ChangeUserPasswordInput } from './dto/change-user-password-input.dto';
import { ChangeUserPhoneInput } from './dto/change-user-phone-input.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly basicAclService: BasicAclService,
  ) {}

  public async create(createUserInput: CreateUserInput): Promise<User> {
    const { phone, email, fullName, password } = createUserInput;

    const existingByPhone = await this.getByOneField({
      field: 'phone',
      value: phone,
      checkExisting: false,
    });

    if (existingByPhone) {
      // eslint-disable-next-line prettier/prettier
      throw new PreconditionFailedException(`already exist an user with the phone ${phone}.`);
    }

    const existingByEmail = await this.getByOneField({
      field: 'email',
      value: email,
      checkExisting: false,
    });

    if (existingByEmail) {
      // eslint-disable-next-line prettier/prettier
      throw new PreconditionFailedException(`already exist an user with the email ${email}.`);
    }

    const aclUser = await this.basicAclService.createUser({
      email,
      password,
      phone,
      roleCode: '02U', // TODO: use a parameter
      anonymous: false,
    });

    try {
      const { authUid } = aclUser;

      const created = this.repository.create({
        email,
        fullName,
        phone,
        authUid,
      });

      const saved = await this.repository.save(created);

      return saved;
    } catch (error) {
      // TODO: delete the user in ACL
      console.log('deleting the user in ACL');

      throw error;
    }
  }

  public async update(updateUserInput: UpdateUserInput): Promise<User> {
    const { authUid } = updateUserInput;

    const existing = await this.getByAuthuid({
      authUid,
    });

    const { fullName } = updateUserInput;

    const preloaded = await this.repository.preload({
      id: existing.id,
      fullName,
    });

    const saved = await this.repository.save(preloaded);

    return saved;
  }

  public async changeEmail(
    changeUserEmailInput: ChangeUserEmailInput,
  ): Promise<User> {
    const { authUid } = changeUserEmailInput;

    const existing = await this.getByAuthuid({
      authUid,
    });

    const { email } = changeUserEmailInput;

    await this.basicAclService.changeEmail({
      email,
      phone: existing.phone,
    });

    const preloaded = await this.repository.preload({
      id: existing.id,
      email,
    });

    const saved = await this.repository.save(preloaded);

    return saved;
  }

  public async changePassword(
    changeUserPasswordInput: ChangeUserPasswordInput,
  ): Promise<User> {
    const { authUid } = changeUserPasswordInput;

    const existing = await this.getByAuthuid({
      authUid,
    });

    const { oldPassword, newPassword } = changeUserPasswordInput;

    await this.basicAclService.changePassword({
      email: existing.email,
      oldPassword,
      newPassword,
    });

    return existing;
  }

  public async changePhone(
    changeUserPhoneInput: ChangeUserPhoneInput,
  ): Promise<User> {
    const { authUid } = changeUserPhoneInput;

    // get the user
    const existing = await this.getByAuthuid({
      authUid,
    });

    const { phone } = changeUserPhoneInput;

    // change the phone in the ACL
    await this.basicAclService.changePhone({
      email: existing.email,
      phone,
    });

    // change the phone here
    const preloaded = await this.repository.preload({
      id: existing.id,
      phone,
    });

    const saved = await this.repository.save(preloaded);

    return saved;
  }

  public async getByOneField(
    getUserByOneFieldInput: GetUserByOneFieldInput,
  ): Promise<User | null> {
    const { field, value, checkExisting = false } = getUserByOneFieldInput;

    const existing = await this.repository.findOne({ [field]: value });

    if (!existing && checkExisting) {
      // eslint-disable-next-line prettier/prettier
      throw new NotFoundException(`can't get the user with the ${field} ${value}.`);
    }

    return existing || null;
  }

  public async getByAuthuid(
    getUserByAuthUidInput: GetUserByAuthUidInput,
  ): Promise<User> {
    const { authUid } = getUserByAuthUidInput;

    const existing = await this.getByOneField({
      field: 'authUid',
      value: authUid,
      checkExisting: true,
    });

    return existing;
  }

  public async resetPassword(
    resetUserPasswordInput: ResetUserPasswordInput,
  ): Promise<string> {
    const { email } = resetUserPasswordInput;

    await this.basicAclService.sendForgottenPasswordEmail({
      email,
    });

    return 'ok';
  }
}
