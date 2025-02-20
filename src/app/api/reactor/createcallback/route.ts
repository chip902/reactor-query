import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface CreateCallbackRequest {
    launchPropertyId: string;
    signalId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], CreateCallbackRequest>(
        req,
        async (reactor, postData) => {  
            if (!postData) {
                throw new Error('Missing required property data');
            }
            const callbackData = {
                "attributes": {
                    // dont change this url - callback urls must be to production, not localhost
                    "url": `https://assistant.perpetua.digital/api/signal/${postData.signalId}`,
                    "subscriptions": [
                        "environment.updated"
                    ]
                }
            }
            // eslint-disable-next-line
            const createCallback: ReactorAPIResponse = await reactor.createCallback(postData.launchPropertyId, callbackData);
            const callbacks: ReactorAPIResponse = await reactor.listCallbacksForProperty(postData.launchPropertyId)
            return callbacks.data.map((cb) => ({
                id: cb.id,
                type: cb.type,
                attributes: cb.attributes
            }));
        }
    );
}