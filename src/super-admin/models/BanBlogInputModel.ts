import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BanBlogInputModel {
  @IsBoolean()
  @ApiProperty({ type: Boolean, example: true })
  isBanned: boolean;
}
