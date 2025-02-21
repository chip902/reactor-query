import { SearchApiResponse, SearchResponseItem, UserCredentials } from "@/lib/types";
import { z } from "zod";
import { NextResponse } from 'next/server';
import { auth } from '@adobe/auth-token';

const SearchFormSchema = z.object({
    launchPropertyId: z.string().min(1, 'Launch Property ID is required'),
    dataElementName: z.string().min(1, 'Data Element Name is required'),
});

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
    }

    // Get API keys from header
    let credentials: UserCredentials;
    try {
        const apiKeysHeader = request.headers.get('x-api-keys');
        if (!apiKeysHeader) {
            return NextResponse.json({ error: 'Missing API keys header' }, { status: 401 });
        }
        try {
            const decodedKeys = Buffer.from(apiKeysHeader, 'base64').toString();
            credentials = JSON.parse(decodedKeys);
            //eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return NextResponse.json({ error: 'Invalid API keys format' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error parsing API keys:', error);
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

        const percentageSignQuery = {
            "data": {
                "query": {
                    "attributes.settings": {
                        "value":
                            `%${validatedData.dataElementName}%`,
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
                ]
            }
        }

        const satelliteQuery = {
            "data": {
                "query": {
                    "attributes.settings": {
                        "value":
                            `_satellite.getVar("${validatedData.dataElementName}")`,
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
                ]
            }
        }

        const queries = [percentageSignQuery, satelliteQuery];
        const allData: SearchResponseItem[] = [];
        let totalHits = 0;

        const searchResults = await Promise.all(queries.map(query =>
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'x-api-key': credentials.clientId,
                    'x-gw-ims-org-id': credentials.orgId,
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json;revision=1'
                },
                body: JSON.stringify(query),
            }).then(res => res.json())
        ));

        // Combine the results
        searchResults.forEach(data => {
            allData.push(...data.data);
            totalHits += data.meta.total_hits;
        });

        if (totalHits > 0) {
            async function processApiResponse(response: SearchApiResponse): Promise<SearchResponseItem[]> {
                const processedData = [];

                for (const item of response.data) {

                    // purge deleted items because teh stupid fucking api doesnt do it
                    if (item.attributes.deleted_at && item.attributes.deleted_at !== null) {
                        continue;
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

            const result = await processApiResponse({ data: allData, meta: { total_hits: totalHits } });
            // Remove duplicates based on id
            const uniqueResults = Array.from(
                new Map(result.map(item => [item.id, item])).values()
            );
            const newData = { ...{ data: uniqueResults }, ...{ meta: { ...{ total_hits: uniqueResults.length } } } };

            return NextResponse.json(newData, { status: 200 });
        }
        // Return the results to the client
        return NextResponse.json({ data: allData, meta: { total_hits: totalHits } }, { status: 200 });

    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

} 
