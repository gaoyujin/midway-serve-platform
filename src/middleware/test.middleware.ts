import { Provide } from '@midwayjs/core';
import { IWebMiddleware } from '@midwayjs/koa';

@Provide()
export class TestMiddleware implements IWebMiddleware {
  resolve() {
    return async (ctx, next) => {
      // 中间件逻辑
      console.log('Before next middleware');
      const result = await next();
      console.log('After next middleware');
      return result;
    };
  }
}
