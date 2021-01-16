import * as request from 'request';
import * as qs from 'qs';

import { sha256, getTimestamp } from './util';

export class Dingtalk {
  /**
   * @val {string} 获取 access_token 的 url
   */
  protected endpointToGetToken = 'https://oapi.dingtalk.com/robot/send';

  protected access_token: string;

  protected secret?: string;

  protected body = {} as any;

  protected at: {
    atMobiles?: string[];
    isAtAll?: boolean;
  } = {};

  constructor(access_token: string, secret?: string) {
    this.secret = secret;
    this.access_token = access_token;
  }

  setAccessToken(value: string) {
    this.access_token = value;

    return this;
  }

  setSecret(value: string) {
    this.secret = value;

    return this;
  }

  setAtMobiles(value?: string[]) {
    this.at = {
      atMobiles: value,
      isAtAll: false,
    };

    return this;
  }

  atAll(type?: boolean) {
    this.at.isAtAll = type ?? true;

    if (this.at.isAtAll) {
      this.at.atMobiles = undefined;
    }

    return this;
  }

  markdown(markdown: { title: string; text: string }) {
    this.body = { msgtype: 'markdown', markdown };

    return this;
  }

  text(content: string) {
    this.body = { msgtype: 'text', text: { content } };

    return this;
  }

  link(link: { text: string; title: string; picUrl?: string; messageUrl: string }) {
    this.body = { msgtype: 'link', link };

    return this;
  }

  async send(data?: Record<string, any>) {
    const { access_token } = this;

    const params = {
      access_token,
    } as {
      access_token: string;
      timestamp?: number;
      sign?: string;
    };

    if (this.secret) {
      params.timestamp = getTimestamp();
      const secretEncode = `${params.timestamp}\n${this.secret}`;
      params.sign = sha256(this.secret, secretEncode, 'base64');
    }

    return request.post(
      `${this.endpointToGetToken}?${qs.stringify(params)}`,
      {
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ ...{ ...this.body, ...(data || {}) }, ...this.at }),
      },
      (_error: Error, response: request.Response) => {
        if (!_error) {
          const body = JSON.parse(response.body);
          if (body.errcode) {
            console.error(body);
          }
        }
      },
    );
  }
}
