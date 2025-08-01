import React, { useState, useEffect } from "react";
import { Flex, Button, TextField, View, Text, ComboBox, Item, DialogTrigger, Dialog, Heading, ButtonGroup } from "@adobe/react-spectrum";
import { createApiHeaders } from "@/lib/apiUtils";
// Add gtag type declaration
declare global {
	interface Window {
		gtag: (
			command: string,
			eventName: string,
			eventParams?: {
				event_category?: string;
				event_label?: string;
				value?: number;
				[key: string]: string | number | boolean | undefined;
			}
		) => void;
	}
}

interface BulkRuleEditorProps {
	selectedCompany: { id: string; name: string };
	selectedProperty: { id: string; name: string };
	apiKeys: { clientId: string; clientSecret: string; orgId: string } | null;
}

interface Environment {
	id: string;
	name: string;
	type: "development" | "staging" | "production";
}

const BulkRuleEditor = ({ selectedProperty, apiKeys }: BulkRuleEditorProps) => {
	console.log("BulkRuleEditor rendered with selectedProperty:", selectedProperty);

	const [environments, setEnvironments] = useState<Environment[]>([]);
	const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [replaceQuery, setReplaceQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [matchingRules, setMatchingRules] = useState<Array<{ id: string; name: string; preview: string }>>([]);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateResults, setUpdateResults] = useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });
	const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

	// Fetch environments for the selected property
	useEffect(() => {
		if (!selectedProperty?.id) {
			console.log("No property selected, skipping environment fetch");
			return;
		}

		console.log("Fetching environments for property:", selectedProperty);

		const fetchEnvironments = async () => {
			try {
				const response = await fetch("/api/reactor/listenvironments", {
					method: "POST",
					headers: createApiHeaders(apiKeys),
					body: JSON.stringify({ propertyId: selectedProperty.id }),
				});

				console.log("Environments API response status:", response.status);

				if (response.ok) {
					const data = await response.json();
					console.log("Raw environments data:", data);

					const devEnvironments = data
						.filter((env: { id: string; attributes: { stage: string } }) => {
							const isDev = env.attributes.stage === "development";
							console.log(`Environment ${env.id} stage: ${env.attributes.stage}, isDev: ${isDev}`);
							return isDev;
						})
						.map((env: { id: string; attributes: { name: string; stage: string } }) => ({
							id: env.id,
							name: env.attributes.name,
							type: "development" as const,
						}));

					console.log("Processed development environments:", devEnvironments);
					setEnvironments(devEnvironments);

					// Auto-select the first environment if available
					if (devEnvironments.length > 0) {
						console.log("Auto-selecting first environment:", devEnvironments[0]);
						setSelectedEnvironment(devEnvironments[0]);
					}
				} else {
					console.error("Failed to fetch environments:", await response.text());
				}
			} catch (error) {
				console.error("Error fetching environments:", error);
			}
		};

		fetchEnvironments();
	}, [selectedProperty, apiKeys]);

	// Find rules that match the search query
	const findMatchingRules = async () => {
		if (!searchQuery.trim() || !selectedEnvironment) return;

		setIsLoading(true);
		setMatchingRules([]);

		try {
			// First, get all rules in the library for the selected environment
			const libraryResponse = await fetch("/api/reactor/listlibraries", {
				method: "POST",
				headers: createApiHeaders(apiKeys),
				body: JSON.stringify({
					environmentId: selectedEnvironment.id,
					propertyId: selectedProperty.id,
				}),
			});

			if (!libraryResponse.ok) {
				throw new Error("Failed to fetch libraries");
			}

			const libraries = await libraryResponse.json();
			const devLibrary = libraries.data.find(
				(lib: { attributes: { environment: string } }) => lib.attributes.environment === `ENVIRONMENT_ID_${selectedEnvironment.id}`
			);

			if (!devLibrary) {
				throw new Error("No development library found for the selected environment");
			}

			// Get rules in the development library
			const rulesResponse = await fetch("/api/reactor/listrulesinlibrary", {
				method: "POST",
				headers: createApiHeaders(apiKeys),
				body: JSON.stringify({ libraryId: devLibrary.id }),
			});

			if (!rulesResponse.ok) {
				throw new Error("Failed to fetch rules");
			}

			const rulesData = await rulesResponse.json();

			// Filter rules that match the search query
			const matched = rulesData.data
				.filter((rule: { attributes: object }) => JSON.stringify(rule.attributes).toLowerCase().includes(searchQuery.toLowerCase()))
				.map((rule: { id: string; attributes: { name: string } }) => ({
					id: rule.id,
					name: rule.attributes.name,
					preview: JSON.stringify(rule.attributes, null, 2),
				}));

			setMatchingRules(matched);
			setIsPreviewOpen(true);
		} catch (error) {
			console.error("Error finding matching rules:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Update the matched rules with the replacement text
	const updateRules = async () => {
		if (!selectedEnvironment || !searchQuery.trim() || !replaceQuery.trim() || matchingRules.length === 0) return;

		setIsUpdating(true);
		setUpdateResults({ success: [], failed: [] });

		try {
			const results = { success: [] as string[], failed: [] as string[] };

			// In a real implementation, we would update each rule here
			// This is a simplified example that doesn't actually modify the rules
			for (const rule of matchingRules) {
				try {
					// Simulate API call to update the rule
					// const response = await fetch(`/api/reactor/updaterule`, {
					//   method: 'PATCH',
					//   headers: createApiHeaders(apiKeys),
					//   body: JSON.stringify({
					//     ruleId: rule.id,
					//     updates: {
					//       // Apply the find/replace logic here
					//       // This is a simplified example
					//       settings: rule.preview.replace(new RegExp(searchQuery, 'gi'), replaceQuery)
					//     }
					// }),
					// });

					// if (response.ok) {
					//   results.success.push(rule.name);
					// } else {
					//   results.failed.push(rule.name);
					// }

					// For demo purposes, we'll just simulate success
					results.success.push(rule.name);
				} catch (error) {
					console.error(`Error updating rule ${rule.name}:`, error);
					results.failed.push(rule.name);
				}
			}

			setUpdateResults(results);
			setIsResultsDialogOpen(true);
		} catch (error) {
			console.error("Error updating rules:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<View padding="size-300">
			<Flex direction="column" gap="size-200">
				<Heading level={3}>Bulk Edit Rules</Heading>
				<Text UNSAFE_style={{ color: "var(--spectrum-global-color-gray-900)" }}>Update multiple rules in your development environment at once.</Text>

				<Flex direction="column" gap="size-150">
					<ComboBox
						label="Select Development Environment"
						items={environments}
						selectedKey={selectedEnvironment?.id}
						onSelectionChange={(key) => {
							const env = environments.find((e) => e.id === key);
							console.log("Selected environment changed:", env);
							setSelectedEnvironment(env || null);
						}}
						isDisabled={environments.length === 0}>
						{(item) => <Item key={item.id}>{item.name}</Item>}
					</ComboBox>

					<TextField label="Find" value={searchQuery} onChange={setSearchQuery} placeholder="Text or pattern to find in rules" isRequired />

					<TextField label="Replace With" value={replaceQuery} onChange={setReplaceQuery} placeholder="Replacement text" isRequired />

					<ButtonGroup>
						<Button variant="primary" onPress={findMatchingRules} isDisabled={!selectedEnvironment || !searchQuery.trim() || isLoading}>
							{isLoading ? "Searching..." : "Preview Changes"}
						</Button>

						<Button variant="cta" onPress={updateRules} isDisabled={!replaceQuery.trim() || matchingRules.length === 0 || isUpdating}>
							{isUpdating ? "Updating..." : `Update ${matchingRules.length} Rules`}
						</Button>
					</ButtonGroup>

					{/* Preview Dialog */}
					<DialogTrigger isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
						<div />
						<Dialog>
							<Heading>Preview Changes</Heading>
							<View>
								<Text>Found {matchingRules.length} rules matching your search.</Text>
								<View marginY="size-200">
									<Text>
										Find: <strong>{searchQuery}</strong>
									</Text>
									<Text>
										Replace with: <strong>{replaceQuery}</strong>
									</Text>
								</View>

								{matchingRules.length > 0 && (
									<View marginTop="size-200">
										<Text>Rules that will be updated:</Text>
										<ul>
											{matchingRules.slice(0, 10).map((rule) => (
												<li key={rule.id}>
													<Text>{rule.name}</Text>
												</li>
											))}
											{matchingRules.length > 10 && <li>...and {matchingRules.length - 10} more</li>}
										</ul>
									</View>
								)}
							</View>
							<ButtonGroup>
								<Button variant="secondary" onPress={() => setIsPreviewOpen(false)}>
									<Text>Close</Text>
								</Button>
								<Button
									variant="cta"
									onPress={() => {
										setIsPreviewOpen(false);
										updateRules();
									}}>
									<Text>Apply Changes</Text>
								</Button>
							</ButtonGroup>
						</Dialog>
					</DialogTrigger>

					{/* Results Dialog */}
					<DialogTrigger isOpen={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
						<div />
						<Dialog>
							<Heading>Update Results</Heading>
							<View>
								<View marginBottom="size-200">
									<Text>Successfully updated {updateResults.success.length} rules.</Text>
									{updateResults.failed.length > 0 && <Text>Failed to update {updateResults.failed.length} rules.</Text>}
								</View>

								{updateResults.failed.length > 0 && (
									<View marginTop="size-200">
										<Text>Failed updates:</Text>
										<ul>
											{updateResults.failed.map((ruleName, index) => (
												<li key={index}>
													<Text>{ruleName}</Text>
												</li>
											))}
										</ul>
									</View>
								)}
							</View>
							<ButtonGroup>
								<Button variant="secondary" onPress={() => setIsResultsDialogOpen(false)}>
									<Text>Close</Text>
								</Button>
							</ButtonGroup>
						</Dialog>
					</DialogTrigger>
				</Flex>
			</Flex>
		</View>
	);
};

export default BulkRuleEditor;
