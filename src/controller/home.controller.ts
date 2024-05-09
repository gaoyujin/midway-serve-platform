import { Context, Controller, Inject, Get, Post } from '@midwayjs/core';

import { BaseController } from './base.controller';
import { ServeEntity } from '../model/config';

@Controller('/')
export class HomeController extends BaseController {
  @Inject()
  ctx: Context;

  // 配置缓存信息
  config: ServeEntity[];

  @Get('/:serve/:id')
  async getAction(): Promise<any> {
    // 读取信息
    if (!this.config) {
      this.config = this.getApiConfig();
    }
    // 中间编排流程

    const result = await this.run(this.config, () => {
      // 业务逻辑
      return 'Hello MidwayJS!';
    });

    return result;
  }

  @Post('/:serve/:id')
  async postAction(): Promise<any> {
    // 读取信息
    if (!this.config) {
      this.config = this.getApiConfig();
    }
    // 中间编排流程
    this.ctx['res'].setHeader('Content-Type', 'application/json');

    const result = await this.run(this.config, async () => {
      // 业务逻辑
      const dataInfo = await this.execRealServe2(this.config);
      console.log('test..............');
      return JSON.stringify(dataInfo.data);
    });

    return result;
  }
}
