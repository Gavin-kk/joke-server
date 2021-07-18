import { HttpException, HttpStatus } from '@nestjs/common';

export class NewHttpException extends HttpException {
  constructor(message: string, httpStatusCode: HttpStatus) {
    super({ statusCode: httpStatusCode, message }, httpStatusCode);
  }
}
