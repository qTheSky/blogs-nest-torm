import { IsBoolean, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BanUserForBlogModel {
  @IsBoolean()
  @ApiProperty({ example: true, type: 'boolean', description: 'true - for ban user, false - for unban user' })
  isBanned: boolean;
  @MinLength(20)
  @IsString()
  @ApiProperty({
    example: 'stringstringstringst',
    type: 'string',
    description: 'The reason why user was banned',
    minLength: 20,
  })
  banReason: string;
  @IsString()
  @ApiProperty({
    example: 'string',
    type: 'string',
    description: 'User will be banned/unbanned for this blog',
  })
  blogId: string;
}
