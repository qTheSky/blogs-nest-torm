import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsModel {
  @IsString()
  @ApiProperty()
  loginOrEmail: string;
  @IsString()
  @ApiProperty()
  password: string;
}
