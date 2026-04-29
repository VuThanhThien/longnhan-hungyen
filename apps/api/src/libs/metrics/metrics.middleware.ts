import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.path === '/metrics' || req.path === '/health') {
      return next();
    }

    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
      const route = req.route?.path || 'unmatched';
      const labels = {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      };
      end(labels);
      httpRequestsTotal.inc(labels);
    });

    next();
  }
}
