import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';

interface CallbackToDeleteRequest {
    callbackId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], CallbackToDeleteRequest>(
        req,
        async (reactor, postData) => {  
            if (!postData) {
                throw new Error('Missing required property data');
            }
            // eslint-disable-next-line
            const deleteCallback = await reactor.deleteCallback(postData.callbackId);
            return [{
                "id": postData.callbackId,
                "attributes": {
                  "created_at": "", // add required properties here
                  "name": "",
                  "orgId": "",
                  "updated_at": "",
                  "token": "",
                  "created_by_email": "",
                  "created_by_display_name": "",
                  "updated_by_email": "",
                  "updated_by_display_name": "",
                  "url": ""
                },
                "type": "callback"
              }]
        }
    );
}