import { NextRequest } from "next/server";
import { createReactorRoute } from "@/lib/reactor-route-utils";

interface GetRuleByIdRequest {
	ruleId: string;
	launchPropertyId: string;
	includeRevisionHistory: boolean;
}

interface RuleData {
	id: string;
	type: string;
	attributes: Record<string, unknown>;
	relationships: {
		property?: {
			data: {
				id: string;
				type: string;
			}
		}
		[key: string]: unknown;
	};
}

interface RuleResponseData {
	data: RuleData[];
	meta: {
		total_hits: number;
		approach?: string;
	}
}

export async function POST(req: NextRequest) {
	return createReactorRoute<RuleResponseData, GetRuleByIdRequest>(req, async (reactor, postData) => {
		if (!postData) {
			throw new Error("Missing required rule ID data");
		}

		console.log("Fetching rule by ID:", postData.ruleId);

		try {
			// First attempt: Direct GET of the rule
			let options = {};
			
			// Include revision history if requested
			if (postData.includeRevisionHistory) {
				options = { "include": "revisions" };
				console.log("Including rule revisions in request");
			}
			
			const rule = await reactor.getRule(postData.ruleId, options);
			console.log("Rule found via direct GET:", rule.data.id);

			// Check if rule belongs to the specified property
			if (rule.data.relationships?.property?.data?.id === postData.launchPropertyId) {
				// Format the response to match search API format for consistency
				return {
					data: [rule.data],
					meta: {
						total_hits: 1,
						approach: "direct-get",
					},
				};
			} else {
				console.log(
					"Rule belongs to a different property.",
					"Found in:",
					rule.data.relationships?.property?.data?.id,
					"Expected:",
					postData.launchPropertyId
				);
				// Return empty results if rule doesn't belong to the specified property
				return { data: [], meta: { total_hits: 0 } };
			}
		} catch (error) {
			console.error("Error fetching rule directly:", error);

			// Second attempt: Search for the rule
			console.log("Trying search API for rule ID:", postData.ruleId);
			try {
				const searchResults = await reactor.search({
					data: {
						query: {
							id: {
								value: postData.ruleId,
							},
							"relationships.property.data.id": {
								value: postData.launchPropertyId,
							},
						},
						resource_types: ["rules"],
					},
				});

				console.log("Search results total hits:", searchResults?.meta?.total_hits || 0);
				return searchResults;
			} catch (searchError) {
				console.error("Error searching for rule:", searchError);
				return { data: [], meta: { total_hits: 0 } };
			}
		}
	});
}
