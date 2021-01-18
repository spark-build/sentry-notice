/**
 * 通过内部整合的方式来触发 hooks
 */
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
