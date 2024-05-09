import { Provide, Inject, App, Controller, Get } from '@midwayjs/decorator';
import { IWebMiddleware } from '@midwayjs/koa';
import * as Koa from 'koa';
 
@Provide()
export class MyService implements IWebMiddleware {
  resolve() {
    return async (ctx, next) => {
      // 中间件逻辑
      console.log('Before next middleware');
      await next();
      console.log('After next middleware');
    };
  }
}
 
@Controller('/')
export class HomeController {
  @App()
  app: Koa<Koa.DefaultState, Koa.DefaultContext>;
  
  @Inject('myService')
  myService: MyService;
 
  @Get('/')
  async home() {
    const middleware = this.myService.resolve();
    this.app.use(middleware);
    this.app.ctx.body = 'Hello, MidwayJS!';
  }
}

在这个示例中，我们定义了一个服务MyService，实现了IWebMiddleware接口，并在resolve方法中定义了Koa中间件的逻辑。然后在HomeController中，我们通过@Inject装饰器获取到MyService的实例，并在一个GET请求处理方法中将中间件添加到Koa应用中。

这样，每当你访问/路径时，你就会触发这个中间件，并在响应体中看到输出结果。