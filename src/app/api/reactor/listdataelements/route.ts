import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ListDataElementsRequest {
    propertyId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], ListDataElementsRequest>(
        req,
        async (reactor, postData) => {
            if (!postData) {
                throw new Error('Missing required property data');
            }
            const allDataElements = [];
            let dataElements: ReactorAPIResponse = await reactor.listDataElementsForProperty(postData.propertyId, { 'page[size]': 100 })
            let { next_page } = dataElements.meta.pagination;
            allDataElements.push(...dataElements.data)

            while (next_page) {
                dataElements = await reactor.listDataElementsForProperty(postData.propertyId, { 'page[size]': 100, 'page[number]': next_page })
                allDataElements.push(...dataElements.data)
                next_page = dataElements.meta.pagination.next_page
            }

            allDataElements.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));

            return allDataElements.map((dataElement) => ({
                id: dataElement.id,
                type: dataElement.type,
                attributes: dataElement.attributes
            }));
        }
    );
}