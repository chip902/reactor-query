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
            const allLibraries = [];
            let libraries: ReactorAPIResponse = await reactor.listLibrariesForProperty(postData.propertyId, { 'page[size]': 100 })
            let { next_page } = libraries.meta.pagination;
            allLibraries.push(...libraries.data)

            while (next_page) {
                libraries = await reactor.listLibrariesForProperty(postData.propertyId, { 'page[size]': 100, 'page[number]': next_page })
                allLibraries.push(...libraries.data)
                next_page = libraries.meta.pagination.next_page
            }

            allLibraries.sort((a, b) => {
                const dateA = a.attributes.published_at;
                const dateB = b.attributes.published_at;

                // Handle cases where either date is null/undefined
                if (!dateA && !dateB) return 0;  // Both null, consider equal
                if (!dateA) return 1;           // A is null, move to end
                if (!dateB) return -1;          // B is null, move to end

                // Both dates exist, compare them
                return dateB.localeCompare(dateA);
            });

            // allLibraries.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));

            return allLibraries.map((library) => ({
                id: library.id,
                type: library.type,
                attributes: library.attributes
            }));
        }
    );
}