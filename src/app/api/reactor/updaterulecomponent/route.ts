import { NextRequest } from "next/server";
import { createReactorRoute } from "@/lib/reactor-route-utils";

interface UpdateRuleComponentRequest {
	componentId: string;
	updates: {
		name?: string;
		settings?: string; // JSON string of component settings
		attributes?: Record<string, unknown>;
		[key: string]: unknown;
	};
	revise?: boolean; // Whether to set meta.action = 'revise'
}

interface UpdateRuleComponentResponse {
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
	return createReactorRoute<UpdateRuleComponentResponse, UpdateRuleComponentRequest>(
		req, 
		async (reactor, postData) => {
			if (!postData) {
				throw new Error("Missing required update rule component data");
			}

			const { componentId, updates, revise = true } = postData;

			if (!componentId) {
				throw new Error("Component ID is required");
			}

			if (!updates || Object.keys(updates).length === 0) {
				throw new Error("Updates are required");
			}

			console.log("Updating rule component:", componentId, "with updates:", updates);

			try {
				// First, get the current component to understand its structure
				const currentComponent = await reactor.getRuleComponent(componentId);
				console.log("Current component data:", currentComponent.data);

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
						id: componentId,
						type: "rule_components",
						attributes: {
							...currentComponent.data.attributes, // Preserve existing attributes
							...updates.attributes // Apply new attributes
						}
					}
				};

				// Handle specific updates
				if (updates.name !== undefined) {
					updateData.data.attributes.name = updates.name;
				}

				if (updates.settings !== undefined) {
					// Validate that settings is proper JSON if provided
					try {
						JSON.parse(updates.settings);
						updateData.data.attributes.settings = updates.settings;
					} catch (_parseError) {
						throw new Error("Invalid JSON in settings field");
					}
				}

				// Add revision meta if requested
				if (revise) {
					updateData.data.meta = {
						action: "revise"
					};
				}

				console.log("Sending component update request:", JSON.stringify(updateData, null, 2));

				// Use the updateRuleComponent method from the Reactor SDK
				const result = await reactor.updateRuleComponent(componentId, updateData);

				console.log("Rule component update successful:", result.data.id);

				return {
					success: true,
					data: result.data
				};

			} catch (error) {
				console.error("Error updating rule component:", error);
				
				// Extract meaningful error message
				let errorMessage = "Failed to update rule component";
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