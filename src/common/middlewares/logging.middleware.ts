import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.time('request-response time');

    res.on('finish', () => {
      Logger.log(
        `requested route: ${req.originalUrl} | method: ${req.method} | status: ${res.statusCode}`,
        LoggingMiddleware.name,
      );
      console.timeEnd('request-response time');
    });

    next();
  }
}
