import { InputType } from '@nestjs/graphql';

import { FindOneInput } from '../../../common/dto/find-one-input.dto';

@InputType()
export class FindOneUserInput extends FindOneInput {}
