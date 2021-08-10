import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Logger,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { NewHttpException } from '@src/common/exception/customize.exception';

@Injectable()
export class LineCheckTransformPipe implements PipeTransform {
  constructor(private readonly schema) {}

  public async transform(value, metadata: ArgumentMetadata) {
    if (this.toValidate(metadata.metatype))
      throw new Error('错误的使用了CheckDtoPipe管道');
    const data = plainToClass(metadata.metatype, value);
    const { error } = this.schema.validate(value);
    if (error) {
      throw new NewHttpException(error);
    }
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
