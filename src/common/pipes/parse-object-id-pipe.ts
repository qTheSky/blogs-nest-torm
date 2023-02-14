import { Injectable } from '@nestjs/common';

@Injectable()
// implements PipeTransform<string, Types.ObjectId>
export class ParseObjectIdPipe {
  // transform(value: string, metadata: ArgumentMetadata) {
  //   return new Types.ObjectId(value);
  // }
}
