import { App, Context, Inject, Provide, makeHttpRequest } from '@midwayjs/core';
import * as fs from 'fs';
import { HttpService } from '@midwayjs/axios';
import { ServeEntity } from '../model/config';
import { TestMiddleware } from '../middleware/test.middleware';
import { Test2Middleware } from '../middleware/test2.middleware';
import { ErrorMiddleware } from '../middleware/error.middleware';

@Provide()
export class BaseController {
  @App()
  app;

  @Inject()
  ctx: Context;

  @Inject()
  httpService: HttpService;

  @Inject()
  testMiddleware: TestMiddleware;

  @Inject()
  test2Middleware: Test2Middleware;

  @Inject()
  errorMiddleware: ErrorMiddleware;

  // 读取配置信息
  getApiConfig(): ServeEntity[] {
    const configPath = this.app.getBaseDir() + '\\api.config.jsonc';
    const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return configJson;
  }

  // 获取真实的服务信息
  getRealServe(configInfo: ServeEntity[]) {
    if (!configInfo || configInfo.length < 1) {
      throw new Error('没有配置服务信息');
    }
    const parameter = this.ctx!['params'];
    if (!parameter || !parameter.serve || !parameter.id) {
      throw new Error('请求服务指向错误：' + JSON.stringify(parameter));
    }

    const findItem = configInfo.find(item => item.key === parameter.serve);
    if (!findItem) {
      throw new Error('请求服务不存在(serve)：' + parameter.serve);
    }

    const findController = findItem.controller.find(
      item => item.id === parameter.id
    );
    if (!findController) {
      throw new Error('请求服务不存在(id)：' + parameter.id);
    }

    return {
      serve: findItem,
      controller: findController,
    };
  }

  // 根据参数信息获取真实的服务
  async execRealServe(configInfo: ServeEntity[]) {
    const serveInfo = this.getRealServe(configInfo);

    const url = serveInfo.serve.url + serveInfo.controller.path;

    const resultInfo = await makeHttpRequest(url, {
      method: this.ctx['request'].method,
      headers: this.ctx['headers'],
      //data: this.ctx['request'].body,
      dataType: 'json',
      contentType: 'json',
      // 发送的 post 为 json
      //contentType?:this.ctx['headers'],
      //dataType?: HttpClientMimeType;
      //data?: Data;
      //timeout?: number;
    });

    return resultInfo;
  }

  // 根据参数信息获取真实的服务
  async execRealServe2(configInfo: ServeEntity[]) {
    const serveInfo = this.getRealServe(configInfo);

    const url = serveInfo.serve.url + serveInfo.controller.path;

    const resultInfo = await this.httpService.request({
      method: this.ctx['request'].method,
      url: url,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Access-Control-Allow-Origin': '*',
        ...this.ctx['headers'],
      },
      data: this.ctx['request'].rawBody,
    });

    return resultInfo;
  }

  // 获取下一个执行
  async nextMiddlewareExec(cacheMiddleware: any[], count: number, fn: any) {
    let result;
    if (count < cacheMiddleware.length) {
      result = await cacheMiddleware[count](this.ctx, async () => {
        const subResult = await this.nextMiddlewareExec(
          cacheMiddleware,
          count + 1,
          fn
        );
        return subResult;
      });
    } else {
      if (fn) result = await fn();
    }
    return result;
  }

  /***
   * 执行业务逻辑
   * parameter fn 是实际的业务逻辑
   */
  async run(configInfo: ServeEntity[], fn: any): Promise<any> {
    const serveInfo = this.getRealServe(configInfo);

    const cacheMiddleware = [];
    const serveMiddleware = serveInfo.serve.middleware;
    const controllerMiddleware = serveInfo.controller.middleware;

    // 服务的中间件
    if (serveMiddleware && serveMiddleware.length > 0) {
      for (const middleware of serveMiddleware) {
        if (!middleware.name) {
          continue;
        }
        const actionClass = await this.app
          .getApplicationContext()
          .getAsync(this.capitalizeFirstLetter(middleware.name));

        if (actionClass) {
          const handler = actionClass.resolve();
          cacheMiddleware.push(handler);
        }
      }
    }
    // 方法的中间件
    if (controllerMiddleware && controllerMiddleware.length > 0) {
      for (const middleware of controllerMiddleware) {
        if (!middleware.name) {
          continue;
        }
        const actionClass = await this.app
          .getApplicationContext()
          .getAsync(this.capitalizeFirstLetter(middleware.name));

        if (actionClass) {
          const handler = actionClass.resolve();
          cacheMiddleware.push(handler);
        }
      }
    }
    // 执行逻辑
    return await this.nextMiddlewareExec(cacheMiddleware, 0, fn);
  }

  // 第一个字母变成小写
  capitalizeFirstLetter(str: string) {
    return str.charAt(0).toLocaleLowerCase() + str.slice(1);
  }
}
