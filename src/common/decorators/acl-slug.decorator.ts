import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const ACL_SLUG_KEY = 'aclSlug';

export const AclSlug = (slug: string): CustomDecorator<string> =>
  SetMetadata(ACL_SLUG_KEY, slug);
