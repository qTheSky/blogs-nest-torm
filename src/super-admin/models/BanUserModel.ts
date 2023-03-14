import { IsBoolean, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BanUserModel {
  @IsBoolean()
  @ApiProperty({ type: Boolean, example: true })
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  @ApiProperty({ type: String, example: 'string', minLength: 20 })
  banReason: string;
}
