import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ListRulesRequest {
    propertyId: string;
}

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[], ListRulesRequest>(
        req,
        async (reactor, postData) => {
            if (!postData) {
                throw new Error('Missing required property data');
            }
            const allRules = [];
            let rules: ReactorAPIResponse = await reactor.listRulesForProperty(postData.propertyId, { 'page[size]': 100 })
            let { next_page } = rules.meta.pagination;
            allRules.push(...rules.data)

            while (next_page) {
                rules = await reactor.listRulesForProperty(postData.propertyId, { 'page[size]': 100, 'page[number]': next_page })
                allRules.push(...rules.data)
                next_page = rules.meta.pagination.next_page
            }

            allRules.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));

            return allRules.map((rule) => ({
                id: rule.id,
                type: rule.type,
                attributes: rule.attributes
            }));
        }
    );
}