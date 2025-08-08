import { NextRequest } from "next/server";
import { createReactorRoute } from "@/lib/reactor-route-utils";

interface UpdateRuleRequest {
	ruleId: string;
	updates: {
		name?: string;
		attributes?: Record<string, unknown>;
		[key: string]: unknown;
	};
	revise?: boolean; // Whether to set meta.action = 'revise'
}

interface UpdateRuleResponse {
	success: boolean;
	data?: {
		id: string;
		type: string;
		attributes: Record<string, unknown>;
		meta?: Record<string, unknown>;
	};
	error?: string;
}

export async function POST(req: NextRequest) {
	return createReactorRoute<UpdateRuleResponse, UpdateRuleRequest>(
		req, 
		async (reactor, postData) => {
			if (!postData) {
				throw new Error("Missing required update rule data");
			}

			const { ruleId, updates, revise = true } = postData;

			if (!ruleId) {
				throw new Error("Rule ID is required");
			}

			if (!updates || Object.keys(updates).length === 0) {
				throw new Error("Updates are required");
			}

			console.log("Updating rule:", ruleId, "with updates:", updates);

			try {
				// Prepare the update data according to JSON API spec
				const updateData: {
					data: {
						id: string;
						type: string;
						attributes: Record<string, unknown>;
						meta?: Record<string, unknown>;
					};
				} = {
					data: {
						id: ruleId,
						type: "rules",
						attributes: {
							...updates.attributes
						}
					}
				};

				// Add other root-level updates (like name)
				if (updates.name) {
					updateData.data.attributes.name = updates.name;
				}

				// Add revision meta if requested
				if (revise) {
					updateData.data.meta = {
						action: "revise"
					};
				}

				console.log("Sending update request:", JSON.stringify(updateData, null, 2));

				// Use the updateRule method from the Reactor SDK
				const result = await reactor.updateRule(ruleId, updateData);

				console.log("Rule update successful:", result.data.id);

				return {
					success: true,
					data: result.data
				};

			} catch (error) {
				console.error("Error updating rule:", error);
				
				// Extract meaningful error message
				let errorMessage = "Failed to update rule";
				if (error instanceof Error) {
					errorMessage = error.message;
				} else if (typeof error === 'object' && error !== null && 'message' in error) {
					errorMessage = (error as { message: string }).message;
				}

				return {
					success: false,
					error: errorMessage
				};
			}
		}
	);
}