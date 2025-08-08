export function createApiHeaders(apiKeys: { clientId: string; clientSecret: string; orgId: string }) {
  const encodedKeys = Buffer.from(JSON.stringify(apiKeys)).toString('base64');
  return {
    'Content-Type': 'application/json',
    'x-api-keys': encodedKeys,
  };
}