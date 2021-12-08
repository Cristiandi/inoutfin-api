import {
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasicAclService } from 'nestjs-basic-acl-sdk';

import appConfig from '../../config/app.config';

import { User } from './user.entity';

import { CreateUserInput } from './dto/create-user-input';
import { GetUserByOneFieldInput } from './dto/get-user-by-one-field-input.dto';
import { GetUserByAuthUidInput } from './dto/get-uset-by-auth-uid-input.dto';
import { ResetUserPasswordInput } from './dto/reset-user-password-input.dto';
import { UpdateUserInput } from './dto/update-user-input.dto';
import { ChangeUserEmailInput } from './dto/change-user-email-input.dto';
import { ChangeUserPasswordInput } from './dto/change-user-password-input.dto';
import { ChangeUserPhoneInput } from './dto/change-user-phone-input.dto';
import { CreateUserFromAuthUidInput } from './dto/create.user-from-auth-uid.input.dto';

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
      throw new PreconditionFailedException(`already exist an user with the phone ${phone}.`);
    }

    const existingByEmail = await this.getByOneField({
      field: 'email',
      value: email,
      checkExisting: false,
    });

    if (existingByEmail) {
      throw new PreconditionFailedException(`already exist an user with the email ${email}.`);
    }

    const aclUser = await this.basicAclService.createUser({
      email,
      password,
      phone: `+57${phone}`,
      roleCode: '02U', // TODO: use a parameter
      sendEmail: true,
      emailTemplateParams: {
        name: fullName,
      }
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
      console.log('deleting the user in ACL');

      await this.basicAclService.deleteUser({
        authUid: aclUser.authUid,
      });

      throw error;
    }
  }

  public async createFromAuthUid(
    createUserFromAuthUidInput: CreateUserFromAuthUidInput
  ): Promise<User> {
    const { authUid, email, fullName = 'No assigned', phone } = createUserFromAuthUidInput;

    const existing = await this.getByOneField({
      field: 'authUid',
      value: authUid,
      checkExisting: false
    });

    if (existing) {
      throw new PreconditionFailedException(`the user with authUid ${authUid} already exist.`);
    }

    const aclUser = await this.basicAclService.createUser({
      authUid,
      roleCode: '02U',// TODO: use a parameter
      sendEmail: true,
      emailTemplateParams: {
        name: fullName,
      }
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
      await this.basicAclService.deleteUser({
        authUid: aclUser.authUid,
      });

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
      authUid: existing.authUid,
      email,
      emailTemplateParams: {
        fullName: existing.fullName,
      }
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
      authUid: existing.authUid,
      oldPassword,
      newPassword,
      emailTemplateParams: {
        fullName: existing.fullName,
      },
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
      authUid: existing.authUid,
      phone: `+57${phone}`,
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

    const existing = await this.getByOneField({
      field: 'email',
      value: email,
      checkExisting: true,
    });

    await this.basicAclService.sendResetPasswordEmail({
      email,
      emailTemplateParams: {
        fullName: existing.fullName,
      }

    });

    return 'ok';
  }

  public async getByIds(ids: number[]): Promise<User[]> {
    return this.repository.findByIds(ids, {
      loadRelationIds: true,
    });
  }
}
