import { HttpException, HttpService, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../../config/app.config';

import { CreateUserInput } from './dto/create-user-input.dto';

@Injectable()
export class BasicAclService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * function to get the admin token
   *
   * @return {*}  {Promise<string>}
   * @memberof BasicAclService
   */
  public async getToken(): Promise<string> {
    const {
      acl: { baseUrl, companyUuid, email, password },
    } = this.appConfiguration;

    const response = await this.httpService.axiosRef({
      url: `${baseUrl}users/login-admin`,
      method: 'post',
      data: {
        companyUuid,
        email,
        password,
      },
    });

    const { data } = response;
    const { accessToken } = data;
    return accessToken;
  }

  /**
   * function to create a user in the ACL
   *
   * @param {CreateUserInput} createUserInput
   * @return {*}
   * @memberof BasicAclService
   */
  public async createUser(createUserInput: CreateUserInput) {
    const {
      email,
      password,
      phone,
      roleCode,
      anonymous = false,
    } = createUserInput;

    try {
      const token = await this.getToken();

      const {
        acl: { baseUrl, companyUuid },
      } = this.appConfiguration;

      const response = await this.httpService.axiosRef({
        url: `${baseUrl}users`,
        method: 'post',
        headers: {
          'company-uuid': companyUuid,
          Authorization: `Bearer ${token}`,
        },
        data: {
          companyUuid,
          email,
          password,
          phone,
          roleCode,
          anonymous,
        },
      });
      const { data } = response;

      return data;
    } catch (error) {
      throw new HttpException(
        error.response.data.statusCode,
        error.response.data.message,
      );
    }
  }
}
