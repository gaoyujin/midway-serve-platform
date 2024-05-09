import { Configuration, App, IMidwayContainer } from '@midwayjs/core';
import * as axios from '@midwayjs/axios';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';

@Configuration({
  imports: [
    axios,
    koa,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }

  async onServerReady(container: IMidwayContainer): Promise<void> {
    // 获取到 koa 中暴露的 Framework
    const framework = await container.getAsync(koa.Framework);
    const server = framework.getServer();
    console.log('server', server);
    // ...
  }
}
