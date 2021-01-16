import * as crypto from 'crypto';
import dayjs = require('dayjs');

type RequestParams = { sign: string; requestBody: any };

/**
 * 验证合法性
 * @see https://docs.sentry.io/product/integrations/integration-platform/webhooks/?platform=node#verifying-the-signature
 */
function verifySignature({ sign, secret, requestBody }: { secret?: string } & RequestParams) {
  const hmac = crypto.createHmac('sha256', secret || '');
  hmac.update(JSON.stringify(requestBody), 'utf8');

  const digest = hmac.digest('hex');

  return digest === sign;
}

const signErrorMessage = 'signature 异常';
export const verifySentryWebHooks = async ({ sign, requestBody }: Partial<RequestParams>) => {
  if (!sign || !requestBody) {
    return Promise.reject(signErrorMessage);
  }

  return verifySignature({ sign, requestBody }) || Promise.reject(signErrorMessage);
};

// const actionTextMap = {
//   created: '创建',
//   resolved: '解决',
//   assigned: '分配',
//   ignored: '',
// };

// @see https://docs.sentry.io/product/integrations/integration-platform/webhooks/?platform=node#request-structure
export const getDingtalkMarkdownDataFromSentry = (resourceType: string, body: Record<string, any>) => {
  if (
    !['error', 'issue', 'metric_alert', 'event_alert', 'installation', 'uninstallation'].includes(
      resourceType,
    )
  ) {
    return Promise.reject('非法的 resource type');
  }

  const title = '异常告警';
  let text = '';

  switch (resourceType) {
    case 'event_alert':
      const data = body?.data?.event || {};
      text = `# ${data.title} \n
> **environment**: ${data.environment} \n
> **culprit**: ${data.culprit} \n
> **level**: ${data.level} \n
> **date**: ${dayjs(data.datetime).format('YYYY-MM-DD HH:mm:ss')} \n
> ##### [查看详情](${data.web_url})
`;
      break;
    case 'issue':
      break;
    case 'error':
      break;
    case 'metric_alert':
      break;
    case 'installation':
      break;
    case 'uninstallation':
      break;
  }

  return {
    title,
    text,
  };
};

export const getSentryProject = async (resourceType: string, body: Record<string, any>): Promise<number> => {
  switch (resourceType) {
    case 'event_alert':
      return body?.data?.event?.project;
    case 'issue':
      return body?.data?.issue?.project?.id;
    case 'error':
      return body?.data?.error?.project;
    case 'metric_alert':
      return body?.data?.metric_alert?.projects;
  }

  throw new Error('不存在 project 信息');
};
