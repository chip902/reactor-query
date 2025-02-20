import { SearchApiResponse, SearchResponseItem } from "@/lib/types";
import { z } from "zod";
import { NextResponse } from 'next/server';
import { auth } from '@adobe/auth-token';
import { safeLog } from '@/utils/safeLogger';

const SearchFormSchema = z.object({
    tabId: z.number().min(1, 'Tab ID is required'),
    launchPropertyId: z.string().min(1, 'Launch Property ID is required'),
    searchValue: z.string().min(1, 'Search Value is required'),
    includeRevisionHistory: z.boolean().optional(),
    includeDeletedItems: z.boolean().optional(),
});

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
        credentials = JSON.parse(apiKeysHeader);
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
        const validatedData = SearchFormSchema.parse(body); // Validate the request body
        const apiUrl = 'https://reactor.adobe.io/search';

        let query;

        switch (validatedData.tabId) {
            case 1: // Text
                query = {
                    "data": {
                        "query": {
                            "attributes.*": {
                                "value": validatedData.searchValue,
                            },
                            "relationships.property.data.id": {
                                "value": validatedData.launchPropertyId // Replace with the actual property ID
                            }
                        },
                        "resource_types": [
                            'rules',
                            'rule_components',
                            'data_elements',
                            'extensions'
                        ]
                    }
                }
                if (!validatedData.includeRevisionHistory) {
                    // @ts-expect-error it doesn tlike this key setuup?
                    query.data.query['attributes.revision_number'] = {
                        value: 0
                    };
                }
                break;
            case 2: // Filter
                query = {
                    "data": {
                        "query": {
                            "attributes.delegate_descriptor_id": {
                                "value": validatedData.searchValue,
                            },
                            "attributes.revision_number": {
                                "value": 0
                            },
                            "relationships.property.data.id": {
                                "value": validatedData.launchPropertyId // Replace with the actual property ID
                            }
                        },
                        "resource_types": [
                            'rule_components',
                            'data_elements',
                        ]
                    }
                }
                break;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'x-api-key': credentials.clientId,
                'x-gw-ims-org-id': credentials.orgId,
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json;revision=1'
            },
            body: JSON.stringify(query),
        });

        // Parse the response
        const data = await response.json();
        // console.log(JSON.stringify(data, null, 2));

        const { total_hits } = data.meta;
        if (total_hits > 0) {
            async function processApiResponse(response: SearchApiResponse): Promise<SearchResponseItem[]> {
                const processedData = [];

                for (const item of response.data) {

                    // I can't get the search query to exclude deleted items so I'm doing dropping them here
                    if (!validatedData.includeDeletedItems) {
                        if (item.attributes.deleted_at && item.attributes.deleted_at !== null) {
                            continue;
                        }
                    }

                    // Im doing this because I want to return rules instead of rule components
                    if (item.type === 'rule_components') {
                        try {
                            const listRulesResponse = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/reactor/listrulesforrulecomponent`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-api-keys': JSON.stringify(credentials),
                                },
                                body: JSON.stringify({ ruleComponentId: item.id }),
                            });

                            if (listRulesResponse.ok) {
                                const listRulesData = await listRulesResponse.json();
                                // Replace the original item with the first item from the response
                                if (listRulesData.length > 0) {
                                    processedData.push(listRulesData[0]);
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching rule component:', error);
                            processedData.push(item); // Keep original item if fetch fails
                        }
                    } else {
                        processedData.push(item);
                    }
                }

                return processedData;
            }

            const result = await processApiResponse(data);
            // Remove duplicates based on id
            const uniqueResults = Array.from(
                new Map(result.map(item => [item.id, item])).values()
            );
            const newData = { ...data, ...{ data: uniqueResults }, ...{ meta: { ...data.meta, ...{ total_hits: uniqueResults.length } } } };

            return NextResponse.json(newData, { status: 200 });
        }

        // Return the results to the client
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

} 
