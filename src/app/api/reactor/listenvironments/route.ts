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
            const environments: ReactorAPIResponse = await reactor.listEnvironmentsForProperty(postData.propertyId);
            return environments.data.map((environment) => ({
                id: environment.id,
                type: environment.type,
                attributes: environment.attributes
            }));
        }
    );
}