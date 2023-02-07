import { IsString } from 'class-validator';

export class AuthCredentialsModel {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
}
