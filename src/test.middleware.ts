import { Injectable, NestMiddleware } from '@nestjs/common';
import { ServerResponse } from 'http';

@Injectable()
export class TestMiddleware implements NestMiddleware {
  use(req: any, res: ServerResponse, next: () => void) {
    res.end('ok');
    next();
  }
}
