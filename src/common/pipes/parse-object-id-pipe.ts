import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string, metadata: ArgumentMetadata) {
    return new Types.ObjectId(value);
  }
}
