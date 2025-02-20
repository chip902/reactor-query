import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ListCallbacksRequest {
    launchPropertyId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], ListCallbacksRequest>(
        req,
        async (reactor, postData) => {  
            if (!postData) {
                throw new Error('Missing required property data');
            }
            // const createCallback: ReactorAPIResponse = await reactor.createCallback(postData.propertyId, callbackData);
            const callbacks: ReactorAPIResponse = await reactor.listCallbacksForProperty(postData.launchPropertyId)
            return callbacks.data.map((cb) => ({
                id: cb.id,
                type: cb.type,
                attributes: cb.attributes
            }));
        }
    );
}