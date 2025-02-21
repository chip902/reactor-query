import { z } from "zod";
import { NextResponse } from 'next/server';
import { auth } from '@adobe/auth-token';
import { safeLog } from '@/utils/safeLogger';

const ListLibrariesForPropertySchema = z.object({
    propertyId: z.string().min(1, 'Launch Property ID is required'),
    pageNumber: z.number().min(1, 'Page is required'),
    pageSize: z.number().min(1, 'Page Size is required'),
    timezone: z.string().min(1, 'Timezone is required'),
});

export async function POST(request: Request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
    }

    // Get API keys from header
    let credentials: { clientId: string; clientSecret: string; orgId: string; };
    try {
        const apiKeysHeader = request.headers.get('x-api-keys');
        if (!apiKeysHeader) {
            return NextResponse.json({ error: 'Missing API keys header' }, { status: 401 });
        }
        try {
            const decodedKeys = Buffer.from(apiKeysHeader, 'base64').toString();
            credentials = JSON.parse(decodedKeys);
        } catch (error) {
            safeLog('Error decoding Base64 API keys', { error, request });
            return NextResponse.json({ error: 'Invalid API keys format' }, { status: 400 });
        }
    } catch (error) {
        safeLog('Error parsing API keys', { error, request });
        return NextResponse.json({ error: 'Invalid API keys format' }, { status: 400 });
    }

    try {
        const { access_token } = await auth({
            environment: 'prod',
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
            scope: "AdobeID, openid, read_organizations, additional_info.job_function, additional_info.projectedProductContext, additional_info.roles"
        });
        const body = await request.json(); // Parse the request body
        const validatedData = ListLibrariesForPropertySchema.parse(body); // Validate the request body
        // https://reactor.adobe.io/properties/{PROPERTY_ID}/libraries
        //GET /companies/:company_id/properties?sort=-name sorting
        // https://reactor.adobe.io/properties/PR906238a59bbf4262bcedba248f483600/libraries?filter%5Bstate%5D=EQ%20published \
        const apiUrl = `https://reactor.adobe.io/properties/${validatedData.propertyId}/libraries?filter[state]=EQ published&sort=-published_at&page[number]=${validatedData.pageNumber}&page[size]=${validatedData.pageSize}`;
        // const apiUrl = `https://reactor.adobe.io/properties/${validatedData.propertyId}/libraries`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'x-api-key': credentials.clientId,
                'x-gw-ims-org-id': credentials.orgId,
                'Accept': 'application/vnd.api+json;revision=1'
            },
        });

        // Parse the response
        const data = await response.json();

        // the timestamps are in UTC so we need to convert them to the user's timezone
        const processedData = {
            ...data,
            // @ts-ignore
            data: data.data.map(library => ({
                ...library,
                attributes: {
                    ...library.attributes,
                    published_at: library.attributes.published_at ?
                        new Date(library.attributes.published_at).toLocaleString('en-US', { timeZone: validatedData.timezone }) : null
                }
            }))
        };

        return NextResponse.json(processedData, { status: 200 });

    } catch (error) {
        safeLog('Error in API route', { error, request });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

} 
