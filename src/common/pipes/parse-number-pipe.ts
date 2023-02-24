import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseNumberPipe implements PipeTransform<string, number | string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const parsed = Number(value);
    if (typeof parsed !== 'number' || isNaN(parsed)) {
      // throw new NotFoundException();
      return value;
    }
    return parsed;
  }
}
