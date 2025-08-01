import { Flex, Button, Text, View } from "@adobe/react-spectrum";
import Data from "@spectrum-icons/workflow/Data";
import Hammer from "@spectrum-icons/workflow/Hammer";
import Calendar from "@spectrum-icons/workflow/Calendar";
import { TruncatedReactorAPIResponseItem } from "@/lib/types";
import { useApiKeys } from "@/app/hooks/useApiKeys";
import { createApiHeaders } from "@/lib/apiUtils";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const downloadCSV = (data: any[], filename: string) => {
	if (data.length === 0) {
		console.warn("No data to export");
		return;
	}

	// Get all possible headers from all items to ensure consistent columns
	const allHeaders = new Set<string>();
	data.forEach((item) => {
		Object.keys(item).forEach((key) => allHeaders.add(key));
	});
	const headers = Array.from(allHeaders).sort();

	// Create CSV rows
	const csvRows = [
		headers.join(","), // Header row
		...data.map((row) =>
			headers
				.map((header) => {
					const value = row[header];
					const stringValue = value === null || value === undefined ? "" : String(value);
					// Wrap values in quotes and escape existing quotes and newlines
					return `"${stringValue.replace(/"/g, '""').replace(/\n/g, " ").replace(/\r/g, " ")}"`;
				})
				.join(",")
		),
	];

	// Create blob and download
	const csvString = csvRows.join("\n");
	const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
};

interface RuleComponent {
	id: string;
	type: string;
	attributes: {
		name: string;
		enabled: boolean;
		published: boolean;
		dirty: boolean;
		order: number;
		negate: boolean;
		timeout: number;
		delegate_descriptor_id: string;
		extension_name: string;
		extension_package_name: string;
		settings: string;
		created_at: string;
		updated_at: string;
		created_by_email?: string;
		created_by_display_name?: string;
		updated_by_email?: string;
		updated_by_display_name?: string;
	};
}

interface RuleWithComponents {
	rule: TruncatedReactorAPIResponseItem;
	events: RuleComponent[];
	conditions: RuleComponent[];
	actions: RuleComponent[];
}

interface FlattenedRuleWithComponents {
	rule_id: string;
	rule_name: string;
	rule_created_at: string;
	rule_updated_at: string;
	rule_created_by_email?: string;
	rule_created_by_display_name?: string;
	rule_updated_by_email?: string;
	rule_updated_by_display_name?: string;

	component_type: "event" | "condition" | "action" | "";
	component_id: string;
	component_name: string;
	component_enabled: string;
	component_published: string;
	component_dirty: string;
	component_order: string;
	component_negate: string;
	component_timeout: string;
	component_delegate_descriptor_id: string;
	component_extension_name: string;
	component_extension_package_name: string;
	component_settings: string;
}

const flattenDataElement = (item: TruncatedReactorAPIResponseItem) => {
	const { id, type, attributes } = item;
	return {
		id,
		type,
		...attributes,
	};
};

const flattenRuleWithComponents = (ruleWithComponents: RuleWithComponents): FlattenedRuleWithComponents[] => {
	const { rule, events, conditions, actions } = ruleWithComponents;

	// If no components, return a single row with empty component fields
	if (events.length === 0 && conditions.length === 0 && actions.length === 0) {
		return [
			{
				rule_id: rule.id,
				rule_name: rule.attributes.name,
				rule_created_at: rule.attributes.created_at,
				rule_updated_at: rule.attributes.updated_at,
				rule_created_by_email: rule.attributes.created_by_email || "",
				rule_created_by_display_name: rule.attributes.created_by_display_name || "",
				rule_updated_by_email: rule.attributes.updated_by_email || "",
				rule_updated_by_display_name: rule.attributes.updated_by_display_name || "",
				component_type: "",
				component_id: "",
				component_name: "",
				component_enabled: "",
				component_published: "",
				component_dirty: "",
				component_order: "",
				component_negate: "",
				component_timeout: "",
				component_delegate_descriptor_id: "",
				component_extension_name: "",
				component_extension_package_name: "",
				component_settings: "",
			},
		];
	}

	const flattenedRows: FlattenedRuleWithComponents[] = [];

	// Process events
	events.forEach((event) => {
		flattenedRows.push({
			rule_id: rule.id,
			rule_name: rule.attributes.name,
			rule_created_at: rule.attributes.created_at,
			rule_updated_at: rule.attributes.updated_at,
			rule_created_by_email: rule.attributes.created_by_email || "",
			rule_created_by_display_name: rule.attributes.created_by_display_name || "",
			rule_updated_by_email: rule.attributes.updated_by_email || "",
			rule_updated_by_display_name: rule.attributes.updated_by_display_name || "",
			component_type: "event",
			component_id: event.id,
			component_name: event.attributes.name,
			component_enabled: String(event.attributes.enabled),
			component_published: String(event.attributes.published),
			component_dirty: String(event.attributes.dirty),
			component_order: String(event.attributes.order),
			component_negate: String(event.attributes.negate),
			component_timeout: String(event.attributes.timeout),
			component_delegate_descriptor_id: event.attributes.delegate_descriptor_id,
			component_extension_name: event.attributes.extension_name,
			component_extension_package_name: event.attributes.extension_package_name,
			component_settings: event.attributes.settings,
		});
	});

	// Process conditions
	conditions.forEach((condition) => {
		flattenedRows.push({
			rule_id: rule.id,
			rule_name: rule.attributes.name,
			rule_created_at: rule.attributes.created_at,
			rule_updated_at: rule.attributes.updated_at,
			rule_created_by_email: rule.attributes.created_by_email || "",
			rule_created_by_display_name: rule.attributes.created_by_display_name || "",
			rule_updated_by_email: rule.attributes.updated_by_email || "",
			rule_updated_by_display_name: rule.attributes.updated_by_display_name || "",
			component_type: "condition",
			component_id: condition.id,
			component_name: condition.attributes.name,
			component_enabled: String(condition.attributes.enabled),
			component_published: String(condition.attributes.published),
			component_dirty: String(condition.attributes.dirty),
			component_order: String(condition.attributes.order),
			component_negate: String(condition.attributes.negate),
			component_timeout: String(condition.attributes.timeout),
			component_delegate_descriptor_id: condition.attributes.delegate_descriptor_id,
			component_extension_name: condition.attributes.extension_name,
			component_extension_package_name: condition.attributes.extension_package_name,
			component_settings: condition.attributes.settings,
		});
	});

	// Process actions
	actions.forEach((action) => {
		flattenedRows.push({
			rule_id: rule.id,
			rule_name: rule.attributes.name,
			rule_created_at: rule.attributes.created_at,
			rule_updated_at: rule.attributes.updated_at,
			rule_created_by_email: rule.attributes.created_by_email || "",
			rule_created_by_display_name: rule.attributes.created_by_display_name || "",
			rule_updated_by_email: rule.attributes.updated_by_email || "",
			rule_updated_by_display_name: rule.attributes.updated_by_display_name || "",
			component_type: "action",
			component_id: action.id,
			component_name: action.attributes.name,
			component_enabled: String(action.attributes.enabled),
			component_published: String(action.attributes.published),
			component_dirty: String(action.attributes.dirty),
			component_order: String(action.attributes.order),
			component_negate: String(action.attributes.negate),
			component_timeout: String(action.attributes.timeout),
			component_delegate_descriptor_id: action.attributes.delegate_descriptor_id,
			component_extension_name: action.attributes.extension_name,
			component_extension_package_name: action.attributes.extension_package_name,
			component_settings: action.attributes.settings,
		});
	});

	return flattenedRows;
};

const LibraryExport = ({
	selectedCompany,
	selectedProperty,
}: {
	selectedCompany: { id: string; name: string };
	selectedProperty: { id: string; name: string };
}) => {
	const { apiKeys } = useApiKeys();
	const [isExporting, setIsExporting] = useState<"data" | "rules" | "history" | null>(null);
	return (
		<Flex direction="column" gap="size-300" marginBottom="size-200" marginTop="size-200">
			<View>
				<Button
					isDisabled={!selectedCompany.id || !selectedProperty.id || isExporting !== null}
					variant="accent"
					UNSAFE_className="hover:cursor-pointer"
					onPress={async () => {
						try {
							setIsExporting("data");
							if (!apiKeys) throw new Error("No API keys available");

							const response = await fetch("/api/reactor/listdataelements", {
								method: "POST",
								headers: createApiHeaders(apiKeys),
								body: JSON.stringify({
									propertyId: selectedProperty.id,
								}),
							});
							if (!response.ok) throw new Error("Failed to fetch data elements");

							const data: TruncatedReactorAPIResponseItem[] = await response.json();
							const flattenedData = data.map(flattenDataElement);

							const filename = `${selectedProperty.name.replace(/\s+/g, "")}_data_elements.csv`;
							downloadCSV(flattenedData, filename);
						} catch (error) {
							console.error("Error exporting data elements:", error);
						} finally {
							setIsExporting(null);
						}
					}}>
					<Data />
					<Text>{isExporting === "data" ? "Exporting..." : "Export all Data Elements to CSV"}</Text>
				</Button>
			</View>
			<View>
				<Button
					isDisabled={!selectedCompany.id || !selectedProperty.id || isExporting !== null}
					variant="accent"
					UNSAFE_className="hover:cursor-pointer"
					onPress={async () => {
						try {
							setIsExporting("rules");
							if (!apiKeys) throw new Error("No API keys available");

							// Fetch all rules for the property
							const rulesResponse = await fetch("/api/reactor/listrules", {
								method: "POST",
								headers: createApiHeaders(apiKeys),
								body: JSON.stringify({
									propertyId: selectedProperty.id,
								}),
							});
							if (!rulesResponse.ok) throw new Error("Failed to fetch rules");

							const rules: TruncatedReactorAPIResponseItem[] = await rulesResponse.json();

							// For each rule, fetch its components (events, conditions, actions)
							const rulesWithComponents: RuleWithComponents[] = [];

							console.log(`Found ${rules.length} rules. Fetching components...`);

							for (const rule of rules) {
								try {
									const componentsResponse = await fetch("/api/reactor/listcomponentsforrule", {
										method: "POST",
										headers: createApiHeaders(apiKeys),
										body: JSON.stringify({
											ruleId: rule.id,
										}),
									});

									let components: RuleComponent[] = [];
									if (componentsResponse.ok) {
										const rawComponents = (await componentsResponse.json()) as RuleComponent[];
										components = rawComponents.map((comp) => ({
											id: comp.id,
											type: comp.type,
											attributes: comp.attributes,
										}));
									} else {
										console.warn(`Failed to fetch components for rule ${rule.id}: ${componentsResponse.statusText}`);
									}

									// Categorize components
									const events: RuleComponent[] = [];
									const conditions: RuleComponent[] = [];
									const actions: RuleComponent[] = [];

									components.forEach((component) => {
										const descriptorId = component.attributes.delegate_descriptor_id || "";
										if (descriptorId.includes("::events::")) {
											events.push(component);
										} else if (descriptorId.includes("::conditions::")) {
											conditions.push(component);
										} else if (descriptorId.includes("::actions::")) {
											actions.push(component);
										}
									});

									rulesWithComponents.push({
										rule,
										events,
										conditions,
										actions,
									});
								} catch (error) {
									console.error(`Error processing rule ${rule.id}:`, error);
									// Add rule with empty components if there's an error
									rulesWithComponents.push({
										rule,
										events: [],
										conditions: [],
										actions: [],
									});
								}
							}

							// Flatten the data for CSV export
							const flattenedData: FlattenedRuleWithComponents[] = [];
							rulesWithComponents.forEach((ruleWithComponents) => {
								const flattened = flattenRuleWithComponents(ruleWithComponents);
								flattenedData.push(...flattened);
							});

							console.log(`Exporting ${flattenedData.length} total rows for ${rules.length} rules`);

							const filename = `${selectedProperty.name.replace(/\s+/g, "")}_rules_with_components.csv`;
							downloadCSV(flattenedData, filename);
						} catch (error) {
							console.error("Error exporting rules with components:", error);
						} finally {
							setIsExporting(null);
						}
					}}>
					<Hammer />
					<Text>{isExporting === "rules" ? "Exporting..." : "Export all Rules with Events/Conditions/Actions to CSV"}</Text>
				</Button>
			</View>
			<View>
				<Button
					isDisabled={!selectedCompany.id || !selectedProperty.id || isExporting !== null}
					variant="accent"
					UNSAFE_className="hover:cursor-pointer"
					onPress={async () => {
						try {
							setIsExporting("history");
							if (!apiKeys) throw new Error("No API keys available");

							const response = await fetch("/api/reactor/listalllibrariesforproperty", {
								method: "POST",
								headers: createApiHeaders(apiKeys),
								body: JSON.stringify({
									propertyId: selectedProperty.id,
								}),
							});
							if (!response.ok) throw new Error("Failed to fetch libraries");

							const data: TruncatedReactorAPIResponseItem[] = await response.json();
							const flattenedData = data.map(flattenDataElement);

							const filename = `${selectedProperty.name.replace(/\s+/g, "")}_libraries.csv`;
							downloadCSV(flattenedData, filename);
						} catch (error) {
							console.error("Error exporting publish history:", error);
						} finally {
							setIsExporting(null);
						}
					}}>
					<Calendar />
					<Text>{isExporting === "history" ? "Exporting..." : "Export Publish History to CSV"}</Text>
				</Button>
			</View>
		</Flex>
	);
};

export default LibraryExport;
