import * as crypto from 'crypto';

type RequestParams = { sign: string; requestBody: any; secret: string };

/**
 * 验证合法性
 * @see https://docs.sentry.io/product/integrations/integration-platform/webhooks/?platform=node#verifying-the-signature
 */
export function verifySentryWebHooksSignature({ sign, secret, requestBody }: RequestParams) {
  const hmac = crypto.createHmac('sha256', secret || '');
  hmac.update(JSON.stringify(requestBody), 'utf8');

  const digest = hmac.digest('hex');

  return digest === sign;
}

export const verifyResourceType = async (resourceType: string) => {
  if (
    !['error', 'issue', 'metric_alert', 'event_alert', 'installation', 'uninstallation'].includes(
      resourceType,
    )
  ) {
    throw new Error('非法的 resource type');
  }
};
