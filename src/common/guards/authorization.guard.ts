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
import { ACL_SLUG_KEY } from '../decorators/acl-slug.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
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

    const aclSlug = this.reflector.get<string>(ACL_SLUG_KEY, context.getHandler());

    if (!aclSlug) {
      throw new InternalServerErrorException('acl slug not found.');
    }

    try {
      Logger.log(`token ${token}.`, AuthorizationGuard.name);
      Logger.log(`slug ${aclSlug}.`, AuthorizationGuard.name);
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
