import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordModel {
  @IsString()
  @ApiProperty({ description: 'Recovery code', example: 'uuid-d-s-x-sad', type: 'string' })
  recoveryCode: string;
  @Length(6, 20)
  @IsString()
  @ApiProperty({ description: 'New Password', example: 'newpassword123', type: 'string', minLength: 6, maxLength: 20 })
  newPassword: string;
}
