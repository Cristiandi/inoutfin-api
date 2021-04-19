export class CreateUserInput {
  readonly email: string;

  readonly password: string;

  readonly phone: string;

  readonly roleCode: string;

  readonly anonymous?: boolean;
}
