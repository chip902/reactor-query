import { NextRequest } from "next/server";
import { createReactorRoute } from "@/lib/reactor-route-utils";
import { ReactorAPIResponse, TruncatedReactorAPIResponseItem } from "@/lib/types";

interface ScanPropertyRequest {
	propertyId: string;
	includeDataElements?: boolean;
	includeRuleComponents?: boolean;
}

interface RuleWithComponents extends TruncatedReactorAPIResponseItem {
	components?: TruncatedReactorAPIResponseItem[];
	attributes: TruncatedReactorAPIResponseItem['attributes'] & {
		enabled?: boolean;
	};
}

interface PropertyScanResponse {
	property: {
		id: string;
		name?: string;
	};
	rules: {
		total: number;
		byExecutionOrder: {
			pageLoad: {
				libraryLoaded: RuleWithComponents[];
				pageBottom: RuleWithComponents[];
				windowLoaded: RuleWithComponents[];
				domReady: RuleWithComponents[];
			};
			directCall: RuleWithComponents[];
			customEvents: Record<string, RuleWithComponents[]>;
		};
		all: RuleWithComponents[];
	};
	dataElements?: {
		total: number;
		items: TruncatedReactorAPIResponseItem[];
	};
	scanTimestamp: string;
}

export async function POST(req: NextRequest) {
	return createReactorRoute<PropertyScanResponse, ScanPropertyRequest>(req, async (reactor, postData) => {
		if (!postData?.propertyId) {
			throw new Error("Missing required property ID");
		}

		const { propertyId, includeDataElements = true, includeRuleComponents = true } = postData;

		// Fetch all rules for the property with pagination
		const allRules: TruncatedReactorAPIResponseItem[] = [];
		let rulesResponse: ReactorAPIResponse = await reactor.listRulesForProperty(propertyId, { "page[size]": 1000 });
		let { next_page } = rulesResponse.meta.pagination;
		allRules.push(...rulesResponse.data);

		while (next_page) {
			rulesResponse = await reactor.listRulesForProperty(propertyId, { "page[size]": 1000, "page[number]": next_page });
			allRules.push(...rulesResponse.data);
			next_page = rulesResponse.meta.pagination.next_page;
		}

		// Fetch rule components for each rule to determine execution order
		const rulesWithComponents: RuleWithComponents[] = [];
		
		for (const rule of allRules) {
			const ruleWithComponents: RuleWithComponents = {
				id: rule.id,
				type: rule.type,
				attributes: rule.attributes,
			};

			if (includeRuleComponents) {
				try {
					const componentsResponse: ReactorAPIResponse = await reactor.listRuleComponentsForRule(rule.id);
					ruleWithComponents.components = componentsResponse.data.map(component => ({
						id: component.id,
						type: component.type,
						attributes: component.attributes,
					}));
				} catch (error) {
					console.error(`Failed to fetch components for rule ${rule.id}:`, error);
					ruleWithComponents.components = [];
				}
			}

			rulesWithComponents.push(ruleWithComponents);
		}

		// Analyze and categorize rules by execution order
		const categorizedRules = analyzeRuleExecutionOrder(rulesWithComponents);

		// Fetch data elements if requested
		let dataElements = undefined;
		if (includeDataElements) {
			const allDataElements: TruncatedReactorAPIResponseItem[] = [];
			let dataElementsResponse: ReactorAPIResponse = await reactor.listDataElementsForProperty(propertyId, { "page[size]": 100 });
			let { next_page: dataElementNextPage } = dataElementsResponse.meta.pagination;
			allDataElements.push(...dataElementsResponse.data);

			while (dataElementNextPage) {
				dataElementsResponse = await reactor.listDataElementsForProperty(propertyId, { 
					"page[size]": 100, 
					"page[number]": dataElementNextPage 
				});
				allDataElements.push(...dataElementsResponse.data);
				dataElementNextPage = dataElementsResponse.meta.pagination.next_page;
			}

			dataElements = {
				total: allDataElements.length,
				items: allDataElements.map(de => ({
					id: de.id,
					type: de.type,
					attributes: de.attributes,
				})).sort((a, b) => a.attributes.name.localeCompare(b.attributes.name)),
			};
		}

		return {
			property: {
				id: propertyId,
			},
			rules: {
				total: rulesWithComponents.length,
				byExecutionOrder: categorizedRules,
				all: rulesWithComponents.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name)),
			},
			dataElements,
			scanTimestamp: new Date().toISOString(),
		};
	});
}

function analyzeRuleExecutionOrder(rules: RuleWithComponents[]) {
	const pageLoadRules = {
		libraryLoaded: [] as RuleWithComponents[],
		pageBottom: [] as RuleWithComponents[],
		windowLoaded: [] as RuleWithComponents[],
		domReady: [] as RuleWithComponents[],
	};
	const directCallRules: RuleWithComponents[] = [];
	const customEventRules: Record<string, RuleWithComponents[]> = {};

	for (const rule of rules) {
		// Check if rule is enabled
		if (rule.attributes.enabled === false) {
			continue;
		}

		// Analyze rule components to determine execution trigger
		const eventComponents = rule.components?.filter(c => 
			c.attributes.delegate_descriptor_id?.includes('::events::')
		) || [];

		if (eventComponents.length === 0) {
			// No event components found, try to infer from rule name or put in uncategorized
			if (rule.attributes.name.toLowerCase().includes('page')) {
				pageLoadRules.pageBottom.push(rule);
			} else {
				// Add to custom events as "uncategorized"
				if (!customEventRules['uncategorized']) {
					customEventRules['uncategorized'] = [];
				}
				customEventRules['uncategorized'].push(rule);
			}
			continue;
		}

		// Categorize based on event type
		for (const eventComponent of eventComponents) {
			const delegateId = eventComponent.attributes.delegate_descriptor_id || '';
			
			// Page Load Events
			if (delegateId.includes('library-loaded') || delegateId.includes('library_loaded')) {
				pageLoadRules.libraryLoaded.push(rule);
			} else if (delegateId.includes('page-bottom') || delegateId.includes('page_bottom')) {
				pageLoadRules.pageBottom.push(rule);
			} else if (delegateId.includes('window-loaded') || delegateId.includes('window_loaded') || delegateId.includes('window.loaded')) {
				pageLoadRules.windowLoaded.push(rule);
			} else if (delegateId.includes('dom-ready') || delegateId.includes('dom_ready') || delegateId.includes('domready')) {
				pageLoadRules.domReady.push(rule);
			}
			// Direct Call Events
			else if (delegateId.includes('direct-call') || delegateId.includes('direct_call')) {
				directCallRules.push(rule);
			}
			// Custom Events
			else {
				// Extract event type from delegate descriptor
				let eventType = 'other';
				
				if (delegateId.includes('click')) {
					eventType = 'click';
				} else if (delegateId.includes('hover')) {
					eventType = 'hover';
				} else if (delegateId.includes('change')) {
					eventType = 'change';
				} else if (delegateId.includes('submit')) {
					eventType = 'submit';
				} else if (delegateId.includes('keypress') || delegateId.includes('keydown') || delegateId.includes('keyup')) {
					eventType = 'keyboard';
				} else if (delegateId.includes('focus') || delegateId.includes('blur')) {
					eventType = 'focus';
				} else if (delegateId.includes('scroll')) {
					eventType = 'scroll';
				} else if (delegateId.includes('media')) {
					eventType = 'media';
				} else if (delegateId.includes('custom')) {
					eventType = 'custom';
				} else if (delegateId.includes('time')) {
					eventType = 'time-based';
				} else if (delegateId.includes('enters-viewport') || delegateId.includes('element-exists')) {
					eventType = 'element-based';
				}

				if (!customEventRules[eventType]) {
					customEventRules[eventType] = [];
				}
				
				// Avoid duplicates
				if (!customEventRules[eventType].find(r => r.id === rule.id)) {
					customEventRules[eventType].push(rule);
				}
			}
		}
	}

	// Sort rules within each category by name for consistency
	Object.keys(pageLoadRules).forEach(key => {
		pageLoadRules[key as keyof typeof pageLoadRules].sort((a, b) => 
			a.attributes.name.localeCompare(b.attributes.name)
		);
	});
	
	directCallRules.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
	
	Object.keys(customEventRules).forEach(key => {
		customEventRules[key].sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
	});

	return {
		pageLoad: pageLoadRules,
		directCall: directCallRules,
		customEvents: customEventRules,
	};
}