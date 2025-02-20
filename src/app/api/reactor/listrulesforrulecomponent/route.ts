import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ListRulesRequest {
    ruleComponentId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], ListRulesRequest>(
        req,
        async (reactor, postData) => {
            if (!postData) {
                throw new Error('Missing required ruleID data');
            }
            const rules: ReactorAPIResponse = await reactor.listRulesForRuleComponent(postData.ruleComponentId);
            return rules.data;
            // return rules.data.map((rule) => ({
            //     id: rule.id,
            //     type: rule.type,
            //     attributes: rule.attributes
            // }));
        }
    );
}