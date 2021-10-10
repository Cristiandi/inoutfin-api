import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
// import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

import appConfig from '../../config/app.config';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSION_NAME_KEY } from '../decorators/permission-name.decorator';

import { BasicAclService } from '../plugins/basic-acl/basic-acl.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly basicAclService: BasicAclService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<string>(IS_PUBLIC_KEY, context.getHandler());

    if (isPublic) return true;

    const ctx = GqlExecutionContext.create(context);
    const { req: request } = ctx.getContext();

    const authorizationHeader: string = request.headers['Authorization'] || request.headers['authorization'];
    if (!authorizationHeader) {
      throw new UnauthorizedException('authorization header not found.');
    }

    const tokenArray = authorizationHeader.split(' ');
    if (tokenArray.length !== 2) {
      throw new UnauthorizedException('invalid token format.');
    }

    const token = tokenArray[1];

    if (!token) {
      throw new UnauthorizedException('token not found.');
    }

    const permissionName = this.reflector.get<string>(PERMISSION_NAME_KEY, context.getHandler());

    if (!permissionName) {
      throw new InternalServerErrorException('acl slug not found.');
    }

    try {
      await this.basicAclService.checkPermission({
        token,
        permissionName,
      });

      // Logger.log(`permission ${JSON.stringify(permission)}.`, AuthorizationGuard.name);

      return true;
    } catch (error) {
      Logger.error(`permission check error ${error.message}.`, AuthorizationGuard.name);
      throw new UnauthorizedException(error.message);
    }
  }
}
