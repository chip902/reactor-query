import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ListPropertiesRequest {
    companyId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], ListPropertiesRequest>(
        req,
        async (reactor, postData) => {
            if (!postData) {
                throw new Error('Missing required property data');
            }

            const allProperties = [];
            let properties: ReactorAPIResponse = await reactor.listPropertiesForCompany(postData.companyId, { 'page[size]': 100 });
            let { next_page } = properties.meta.pagination;
            allProperties.push(...properties.data)

            while (next_page) {
                properties = await reactor.listPropertiesForCompany(postData.companyId, { 'page[size]': 100, 'page[number]': next_page })
                allProperties.push(...properties.data)
                next_page = properties.meta.pagination.next_page
            }

            allProperties.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));

            return allProperties.map((property) => ({
                id: property.id,
                type: property.type,
                attributes: property.attributes
            }));
        }
    );
}