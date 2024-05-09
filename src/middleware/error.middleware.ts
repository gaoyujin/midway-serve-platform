import { Provide } from '@midwayjs/core';
import { IWebMiddleware } from '@midwayjs/koa';
import { CustomHttpError } from '../common/CustomHttpError';

@Provide()
export class ErrorMiddleware implements IWebMiddleware {
  resolve() {
    return async (ctx, next) => {
      // 中间件逻辑
      console.log('Before error');
      await next();
      throw new CustomHttpError('测试中间件异常');
    };
  }
}
