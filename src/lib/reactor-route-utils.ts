// lib/reactor-route-utils.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@adobe/auth-token';
const Reactor = require('@adobe/reactor-sdk').default;
import { UserCredentials } from '@/lib/types';

type NoPostData = undefined;

type ReactorHandlerFunction<T, P = NoPostData> = (
    reactor: typeof Reactor,
    postData?: P
) => Promise<T>;

async function initializeReactor(credentials: UserCredentials) {
    if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error('Missing client credentials');
    }

    const { access_token } = await auth({
        environment: 'prod',
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        scope: "AdobeID, openid, read_organizations, additional_info.job_function, additional_info.projectedProductContext, additional_info.roles"
    });

    const reactorUrl = 'https://reactor.adobe.io';
    return new Reactor(access_token, {
        reactorUrl,
        customHeaders: {
            'x-gw-ims-org-id': credentials.orgId
        }
    });
}

export async function createReactorRoute<T, P = NoPostData>(
    request: NextRequest,
    handler: ReactorHandlerFunction<T, P>
) {
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    try {
        let postData: P | undefined;
        const contentType = request.headers.get('content-type');

        // Only try to parse JSON if it's not NoPostData type and content-type is application/json
        if (contentType?.includes('application/json')) {
            try {
                const text = await request.text();
                if (text) {
                    postData = JSON.parse(text) as P;
                }
            } catch (_parseError) {
                return NextResponse.json(
                    { error: 'Invalid JSON in request body' },
                    { status: 400 }
                );
            }
        }

        let clientId, clientSecret, orgId;
        try {
            const apiKeysHeader = request.headers.get('x-api-keys');
            if (!apiKeysHeader) {
                return NextResponse.json({ error: 'Missing API keys header' }, { status: 401 });
            }
            ({ clientId, clientSecret, orgId } = JSON.parse(apiKeysHeader));
        } catch (error) {
            console.error('Error parsing API keys:', error);
            return NextResponse.json({ error: 'Invalid API keys format' }, { status: 400 });
        }

        if (!clientId || !clientSecret || !orgId) {
            return NextResponse.json({ error: 'Missing API keys' }, { status: 401 });
        }

        const reactor = await initializeReactor({ clientId, clientSecret, orgId });

        const result = await handler(reactor, postData);
        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error('Error processing request:', error);
        if (error instanceof Error) {
            if (error.message === 'Missing client credentials') {
                return NextResponse.json({ error: 'Missing client credentials' }, { status: 400 });
            }
        }
        return NextResponse.json(
            { error: 'An error occurred while processing the request' },
            { status: 500 }
        );
    }
}