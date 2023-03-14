import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordRecoveryModel {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'User email', example: 'user@example.com', type: 'string', format: 'email' })
  email: string;
}
