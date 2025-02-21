import { UserCredentials } from './types';

/**
 * Encodes API credentials as a Base64 string for secure transmission
 */
export function encodeApiKeys(credentials: UserCredentials): string {
    return Buffer.from(JSON.stringify(credentials)).toString('base64');
}

/**
 * Creates headers with encoded API keys
 */
export function createApiHeaders(apiKeys: UserCredentials | null, additionalHeaders: Record<string, string> = {}): HeadersInit {
    if (!apiKeys) {
        throw new Error('API keys are required');
    }

    return {
        'Content-Type': 'application/json',
        'x-api-keys': encodeApiKeys(apiKeys),
        ...additionalHeaders
    };
}
