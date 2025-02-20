import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ListEnvironmentsRequest {
    propertyId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], ListEnvironmentsRequest>(
        req,
        async (reactor, postData) => {
            if (!postData) {
                throw new Error('Missing required property data');
            }
            const extensions: ReactorAPIResponse = await reactor.listExtensionsForProperty(postData.propertyId);
            return extensions.data.map((extension) => ({
                id: extension.id,
                type: extension.type,
                attributes: extension.attributes
            }));
        }
    );
}