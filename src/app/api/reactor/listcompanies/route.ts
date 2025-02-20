// app/api/launch/listcompanies/route.ts
import { NextRequest } from 'next/server';
import { createReactorRoute } from '@/lib/reactor-route-utils';
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from '@/lib/types';

export async function POST(req: NextRequest) {
    return createReactorRoute<TruncatedReactorAPIResponseItem[]>(req, async (reactor) => {
        const allCompanies = [];

        let companies: ReactorAPIResponse = await reactor.listCompanies({ 'page[size]': 100 })
        let { next_page } = companies.meta.pagination;
        allCompanies.push(...companies.data)

        while (next_page) {
            companies = await reactor.listCompanies({ 'page[size]': 100, 'page[number]': next_page })
            allCompanies.push(...companies.data)
            next_page = companies.meta.pagination.next_page
        }

        allCompanies.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
        return allCompanies.map((company) => ({
            id: company.id,
            type: company.type,
            attributes: company.attributes
        }));
    });
}