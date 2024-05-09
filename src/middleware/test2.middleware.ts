import { Provide } from '@midwayjs/core';
import { IWebMiddleware } from '@midwayjs/koa';

@Provide()
export class Test2Middleware implements IWebMiddleware {
  resolve() {
    return async (ctx, next) => {
      // 中间件逻辑
      console.log('test2 Before');
      const result = await next();
      console.log('test2 After');
      return result;
    };
  }
}
