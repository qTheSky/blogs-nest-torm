import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishQuestionModel {
  @IsBoolean()
  @ApiProperty({ type: Boolean, example: true })
  published: boolean;
}
