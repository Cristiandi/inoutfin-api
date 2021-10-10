import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GraphQLClient, gql } from 'graphql-request';

import appConfig from '../../../config/app.config';

import { CreateUserInput } from './dto/create-user-input.dto';
import { GetUserInput } from './dto/get-user-uid-input.dto';
import { SendResetPasswordEmailInput } from './dto/send-reset-password-email-input.dto';
import { ChangeEmailInput } from './dto/change-email-input.dto';
import { ChangePasswordInput } from './dto/change-password-input.dto';
import { ChangePhoneInput } from './dto/change-phone-input.dto';
import { CheckPermissionInput } from './dto/check-permission-input.dto';

@Injectable()
export class BasicAclService {

  private graphQLClient: GraphQLClient;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    this.graphQLClient = this.initGraphQLClient();
  }

  private initGraphQLClient() {
    const {
      acl: { baseUrl, accessKey },
    } = this.appConfiguration;

    const graphQLClient = new GraphQLClient(baseUrl + 'graphql', {
      headers: {
        'access-key': accessKey,
      },
    });

    return graphQLClient;
  }

  /**
   * function to create a user in the ACL
   *
   * @param {CreateUserInput} createUserInput
   * @return {*}
   * @memberof BasicAclService
   */
  public async createUser(input: CreateUserInput) {
    const mutation = gql`
        mutation createUser (
            $companyUid: String!
            $authUid: String
            $email: String
            $phone: String
            $password: String
            $roleCode: String
            $sendEmail: Boolean
            $emailTemplateParams: JSONObject
        ) {
            createUser (
                createUserInput: {
                    companyUid: $companyUid
                    authUid: $authUid
                    email: $email
                    phone: $phone
                    password: $password
                    roleCode: $roleCode
                    sendEmail: $sendEmail
                    emailTemplateParams: $emailTemplateParams
                }
            ) {
              id
              authUid
              email
              phone
              createdAt
              updatedAt
            }
        }
    `;

      const { companyUid } = this.appConfiguration.acl;
      const { authUid, email, password, phone, roleCode, sendEmail, emailTemplateParams  } = input;

      const variables = {
        companyUid,
        authUid,
        email,
        phone,
        password,
        roleCode,
        sendEmail,
        emailTemplateParams,
      };

      const data = await this.graphQLClient.request(mutation, variables);

      const { createUser } = data;

      return createUser;
  }

  /**
   * function to get a user by his auth uid
   *
   * @param {GetUserInput} input
   * @return {*}
   * @memberof BasicAclService
   */
   async getUser(input: GetUserInput) {
    const query = gql`
      query getOneUser (
          $authUid: String!
      ) {
          getOneUser (
              getOneUserInput: {
                  authUid: $authUid
              }
          ) {
              id
              authUid
              email
              phone
              createdAt
              updatedAt
          }
      }
    `;

    const { authUid } = input;

    const variables = {
      authUid,
    };

    const data = await this.graphQLClient.request(query, variables);

    const { getOneUser } = data;

    return getOneUser;
  }

  /**
   * function to send the forgotten password email
   *
   * @param {SendForgottenPasswordEmailInput} sendForgottenPasswordEmailInput
   * @return {*}
   * @memberof BasicAclService
   */
  async sendResetPasswordEmail(
    input: SendResetPasswordEmailInput,
  ) {
    const mutation = gql`
      mutation sendResetPasswordEmail (
          $companyUid: String!
          $email: String!
          $emailTemplateParams: JSONObject
      ) {
          sendResetUserPasswordEmail (
              sendResetUserPasswordEmailInput: {
                  companyUid: $companyUid
                  email: $email
                  emailTemplateParams: $emailTemplateParams
              }
          ) {
              message
          }
      }
    `;

    const { companyUid } = this.appConfiguration.acl;
    const { email, emailTemplateParams } = input;

    const variables = {
      companyUid,
      email,
      emailTemplateParams,
    };

    const data = await this.graphQLClient.request(mutation, variables);

    const { sendResetUserPasswordEmail } = data;

    return sendResetUserPasswordEmail;
  }

  /**
   * function to change the email
   *
   * @param {ChangeEmailInput} input
   * @return {*}
   * @memberof BasicAclService
   */
  async changeEmail(input: ChangeEmailInput) {
    const mutation = gql`
      mutation changeUserEmail (
          $authUid: String!
          $email: String!
          $emailTemplateParams: JSONObject
      ) {
          changeUserEmail (
              changeUserEmailInput: {
                  authUid: $authUid
                  email: $email
                  emailTemplateParams: $emailTemplateParams
              }
          ) {
              id
              authUid
              email
              phone
              createdAt
              updatedAt
          }
      }
    `;

    const { authUid, email, emailTemplateParams } = input;

    const variables = {
      authUid,
      email,
      emailTemplateParams,
    };

    const data = await this.graphQLClient.request(mutation, variables);

    const { changeUserEmail } = data;

    return changeUserEmail;
  }

  /**
   * function to change the password
   *
   * @param {ChangePasswordInput} changePasswordInput
   * @return {*}
   * @memberof BasicAclService
   */
  async changePassword(input: ChangePasswordInput) {
    const mutation = gql`
      mutation changeUserPassword (
          $authUid: String!
          $oldPassword: String!
          $newPassword: String!
          $emailTemplateParams: JSONObject
      ) {
          changeUserPassword (
              changeUserPasswordInput: {
                  authUid: $authUid
                  oldPassword: $oldPassword
                  newPassword: $newPassword
                  emailTemplateParams: $emailTemplateParams
              }
          ) {
              id
              authUid
              email
              phone
              company {
                  id
              }
          }
      }
    `;

    const { authUid, oldPassword, newPassword, emailTemplateParams } = input;

    const variables = {
      authUid,
      oldPassword,
      newPassword,
      emailTemplateParams
    };

    const data = await this.graphQLClient.request(mutation, variables);

    const { changeUserPassword } = data;

    return changeUserPassword;
  }

  /**
   * function to change the phone
   *
   * @param {ChangePhoneInput} changePhoneInput
   * @return {*}
   * @memberof BasicAclService
   */
  public async changePhone(input: ChangePhoneInput) {
    const mutation = gql`
      mutation changeUserPhone (
          $authUid: String!
          $phone: String!
      ) {
          changeUserPhone (
              changeUserPhoneInput: {
                  authUid: $authUid
                  phone: $phone
              }
          ) {
              id
              authUid
              email
              phone
              createdAt
              updatedAt
          }
      }
    `;

    const { authUid, phone } = input;

    const variables = {
      authUid,
      phone,
    };

    const data = await this.graphQLClient.request(mutation, variables);

    const { changeUserPhone } = data;

    return changeUserPhone;
  }

  public async checkPermission(input: CheckPermissionInput) {
    const query = gql`
      query checkPermission (
          $companyUid: String!
          $permissionName: String!
          $token: String
          $apiKey: String
      ) {
          checkPermission (
              checkPermissionInput: {
                  companyUid: $companyUid
                  permissionName: $permissionName
                  token: $token
                  apiKey: $apiKey
              }
          ) {
              id
              uid
              name
              allowed
          }
      }
    `;

    const { acl: { companyUid } } = this.appConfiguration;  
    const { permissionName, token, apiKey } = input;

    const variables = {
      companyUid,
      permissionName,
      token,
      apiKey,
    };

    const data = await this.graphQLClient.request(query, variables);

    const { checkPermission } = data;

    return checkPermission;
  }
}
