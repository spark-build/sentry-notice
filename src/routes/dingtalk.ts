import { FastifyInstance } from 'fastify';

import { Dingtalk } from '@/Support/Dingtalk';
import { getDingtalkMarkdownDataFromSentry, getSentryProject } from '@/Support/Sentry';
import config from '@/config';
// import config from '@/config';

export default function dingtalk(app: FastifyInstance) {
  app.post('/dingtalk/:id', async (req, res) => {
    try {
      const id = (req.params as Record<string, any>)?.id;
      if (!id) {
        throw new Error('访问不合法');
      }

      const projectConfig = config.projects[id];
      if (!projectConfig) {
        throw new Error('访问不合法');
      }

      // 验证 sign 是否合法
      // await verifySentryWebHooks({
      //   sign: String(req.headers['sentry-hook-signature']),
      //   requestBody: req.body,
      // });

      const dingtalkMarkdownData = await getDingtalkMarkdownDataFromSentry(
        String(req.headers['sentry-hook-resource']),
        req.body as any,
      );

      // 获取当前触发的项目 id
      const sentryProject = await getSentryProject(
        String(req.headers['sentry-hook-resource']),
        req.body as any,
      );

      const dingtalkConfig = projectConfig.dingtalk[sentryProject];

      if (dingtalkConfig.name) {
        dingtalkMarkdownData.text = dingtalkMarkdownData.text.replace(
          '#',
          `## ${dingtalkConfig.name} \n> **environment**: `,
        );
      }

      await new Dingtalk(dingtalkConfig.accessToken, dingtalkConfig.secret)
        .setAtMobiles(dingtalkConfig.atMobiles)
        .atAll(dingtalkConfig.isAtAll ?? false)
        .markdown(dingtalkMarkdownData)
        .send();

      res.send(200);
    } catch (error) {
      res.code(400).send(String(error));
    }
  });
}
