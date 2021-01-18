import * as dayjs from 'dayjs';
import { verifyResourceType } from './verify';

export type MajorInfo = {
  title: string;
  environment: string;
  culprit: string;
  level: string;
  date?: string;
  detailUrl: string;
  projectName?: string;
};

export const getDingtalkMarkdownData = (data: MajorInfo) => ({
  title: data.title,
  text: `## ${data.projectName ? `${data.projectName} \n> **message**: ` : ''}[${data.title}](${
    data.detailUrl
  }) \n
> **environment**: ${data.environment} \n
> **culprit**: ${data.culprit} \n
> **level**: ${data.level} \n
> **date**: ${data.date} \n
`,
});

export const extractMajorInfoByWenHooksData = (data: Record<string, any> = {}) => {
  const { title, environment, culprit, level, web_url: detailUrl, timestamp } = data;

  return {
    title,
    environment,
    culprit,
    level,
    detailUrl,
    date: dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss'),
  };
};

/**
 * 内部集成
 *
 * @see https://docs.sentry.io/product/integrations/integration-platform/webhooks/?platform=node#request-structure
 */
export const getDingtalkMarkdownDataFromSentryInternalIntegration = ({
  resourceType,
  body,
  projectName,
}: {
  resourceType: string;
  body: Record<string, any>;
  projectName?: string;
}): { title: string; text: string } => {
  verifyResourceType(resourceType);

  switch (resourceType) {
    case 'issue':
      return {} as any;
    case 'error':
      return getDingtalkMarkdownData({
        ...extractMajorInfoByWenHooksData(body?.data?.error),
        projectName,
      });
    case 'metric_alert':
      return {} as any;
    case 'installation':
      return {} as any;
    case 'uninstallation':
      return {} as any;
    default:
      // event_alert
      return getDingtalkMarkdownData({
        ...extractMajorInfoByWenHooksData(body?.data?.event),
        projectName,
      });
  }
};
