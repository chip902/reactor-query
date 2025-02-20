const isDev = process.env.NODE_ENV === 'development';

interface SafeLogOptions {
    error?: unknown;
    request?: Request;
    sensitiveKeys?: string[];
}

const redactSensitiveData = (data: any, sensitiveKeys: string[] = ['clientId', 'clientSecret', 'apiKey', 'x-api-keys']) => {
    if (typeof data !== 'object' || data === null) return data;
    
    const redacted = { ...data };
    for (const key of Object.keys(redacted)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
            redacted[key] = '[REDACTED]';
        } else if (typeof redacted[key] === 'object') {
            redacted[key] = redactSensitiveData(redacted[key], sensitiveKeys);
        }
    }
    return redacted;
};

export const safeLog = (message: string, options: SafeLogOptions = {}) => {
    const { error, request, sensitiveKeys } = options;
    
    // Check if we should redact logs
    const shouldRedact = request?.headers.get('x-redact-logs') === 'true';
    
    if (isDev && !shouldRedact) {
        // In development without redaction, log more details
        if (error instanceof Error) {
            console.error(`${message}:`, error.message);
            if (error.stack) console.error(error.stack);
        } else if (error) {
            console.error(`${message}:`, redactSensitiveData(error, sensitiveKeys));
        } else {
            console.error(message);
        }
    } else {
        // In production or when redaction is requested, log minimal info
        console.error(message);
    }
};
