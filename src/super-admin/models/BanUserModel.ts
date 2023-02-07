import { IsBoolean, IsString, MinLength } from 'class-validator';

export class BanUserModel {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  banReason: string;
}
