import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ListPropertiesRequest {
    ruleId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], ListPropertiesRequest>(
        req,
        async (reactor, postData) => {  
            if (!postData) {
                throw new Error('Missing required ruleID data');
            }
            const ruleComponents: ReactorAPIResponse = await reactor.listRuleComponentsForRule(postData.ruleId);
            return ruleComponents.data.map((ruleComponent) => ({
                id: ruleComponent.id,
                type: ruleComponent.type,
                attributes: ruleComponent.attributes
            }));
        }
    );
}