import { NextRequest } from "next/server";
import { createReactorRoute } from "@/lib/reactor-route-utils";
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from "@/lib/types";

interface ListEnvironmentsRequest {
	propertyId: string;
}

export async function POST(req: NextRequest) {
	console.log("ListEnvironments API called");
	try {
		return await createReactorRoute<TruncatedReactorAPIResponseItem[], ListEnvironmentsRequest>(req, async (reactor, postData) => {
			console.log("ListEnvironments - Processing request with data:", postData);
			if (!postData) {
				throw new Error("Missing required property data");
			}
			if (!postData.propertyId) {
				throw new Error("Missing propertyId in request");
			}

			console.log(`Fetching environments for property: ${postData.propertyId}`);
			const environments: ReactorAPIResponse = await reactor.listEnvironmentsForProperty(postData.propertyId);
			console.log(`Found ${environments.data?.length || 0} environments`);

			if (!environments.data) {
				throw new Error("No environments data returned from API");
			}

			const result = environments.data.map((environment) => ({
				id: environment.id,
				type: environment.type,
				attributes: environment.attributes,
			}));

			console.log("Returning environments:", result);
			return result;
		});
	} catch (error) {
		console.error("Error in listEnvironments API:", error);
		throw error;
	}
}
