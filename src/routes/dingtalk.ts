import { FastifyInstance } from 'fastify';

import { Dingtalk } from '@/Support/Dingtalk';
import {
  getDingtalkMarkdownData,
  extractMajorInfoByWenHooksData,
  getDingtalkMarkdownDataFromSentryInternalIntegration,
  verifySentryWebHooksSignature,
} from '@/Support/Sentry';
import config from '@/config';

/**
 * sentry 的 webhooks 有两种配置方式，一种是项目内部配置，另一种是整个 sentry 的内部集成配置
 */
export default function dingtalk(app: FastifyInstance) {
  // 内部集成，用于兜底
  app.post('/dingtalk', async (req, res) => {
    try {
      const { dingtalk } = config.projects || {};
      if (!dingtalk) {
        throw new Error('访问不合法');
      }

      // 验证 sign 是否合法
      await verifySentryWebHooksSignature({
        sign: String(req.headers['sentry-hook-signature']),
        requestBody: req.body,
        secret: config.clientSecret,
      });

      const dingtalkMarkdownData = await getDingtalkMarkdownDataFromSentryInternalIntegration({
        resourceType: String(req.headers['sentry-hook-resource']),
        body: req.body as any,
      });

      await new Dingtalk(dingtalk.accessToken, dingtalk.secret)
        .setAtMobiles(dingtalk.atMobiles)
        .atAll(dingtalk.isAtAll ?? false)
        .markdown(dingtalkMarkdownData)
        .send();

      res.send(200);
    } catch (error) {
      const errorMessage = `[internal integration]: ${String(error)}`;

      req.log.error(errorMessage);

      res.code(400).send(errorMessage);
    }
  });

  // 单一项目独立配置
  app.post('/dingtalk/:id', async (req, res) => {
    try {
      const id = (req.params as Record<string, any>)?.id;
      if (!id) {
        throw new Error('访问不合法');
      }

      const projectConfig = config.projects?.[id];
      if (!projectConfig) {
        throw new Error('访问不合法');
      }

      const data = req.body as Record<string, any>;
      const dingtalkMarkdownData = await getDingtalkMarkdownData({
        ...extractMajorInfoByWenHooksData({
          ...data?.event,
          ...data,
        }),
        projectName: data?.project_name,
      });

      await new Dingtalk(projectConfig.accessToken, projectConfig.secret)
        .setAtMobiles(projectConfig.atMobiles)
        .atAll(projectConfig.isAtAll ?? false)
        .markdown(dingtalkMarkdownData)
        .send();

      res.send(200);
    } catch (error) {
      const errorMessage = `[alone integration]: ${String(error)}`;

      req.log.error(errorMessage);

      res.code(400).send(errorMessage);
    }
  });
}
