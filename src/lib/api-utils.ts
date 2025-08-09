import { ApiKeySet } from './types';

export function createApiHeaders(apiKeys: { clientId: string; clientSecret: string; orgId: string } | ApiKeySet) {
  // Extract the basic key properties, handling both old and new formats
  const keyData = {
    clientId: apiKeys.clientId,
    clientSecret: apiKeys.clientSecret,
    orgId: apiKeys.orgId
  };
  
  const encodedKeys = Buffer.from(JSON.stringify(keyData)).toString('base64');
  return {
    'Content-Type': 'application/json',
    'x-api-keys': encodedKeys,
  };
}