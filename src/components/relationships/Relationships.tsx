"use client";
import { useState, useEffect, useCallback } from "react";
import { createApiHeaders } from "@/lib/apiUtils";
import { Flex, Item, Text, ListView, Divider, SearchField } from "@adobe/react-spectrum";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { TruncatedReactorAPIResponseItem } from "@/lib/types";

// Components
import NoResultsMessage from "@/components/relationships/NoResultsMessage";
import SelectARule from "@/components/relationships/SelectARule";
import SelectAProperty from "@/components/relationships/SelectAProperty";
import SelectADataElement from "@/components/relationships/SelectADataElement";
import Link from "next/link";

// icons
import LinkOut from "@spectrum-icons/workflow/LinkOut";
import Hammer from "@spectrum-icons/workflow/Hammer";
import Data from "@spectrum-icons/workflow/Data";
import ArrowRight from "@spectrum-icons/workflow/ArrowRight";
import Copy from "@spectrum-icons/workflow/Copy";

// utils
const searchComponentSettings = (
	components: TruncatedReactorAPIResponseItem[],
	pattern: RegExp
): { matchName: string; typeName: string; delegate_descriptor_id: string; componentId: string }[] => {
	const matches = new Set<{ matchName: string; typeName: string; delegate_descriptor_id: string; componentId: string }>();

	components.forEach((component) => {
		try {
			const settings = component.attributes?.settings ?? "";
			let match;
			while ((match = pattern.exec(settings)) !== null) {
				// match[2] is the capture group from _satellite.getVar
				// match[3] is the capture group from %...%
				const matchName = match[2] || match[3];
				if (matchName) {
					matches.add({
						componentId: component.id,
						matchName,
						typeName: component.attributes?.name,
						delegate_descriptor_id: component.attributes.delegate_descriptor_id || "",
					});
				}
			}
		} catch (e) {
			console.error("Error processing component:", e);
		}
	});
	return Array.from(matches);
};

const formatDelegateDescriptorId = (delegate_descriptor_id: string) => {
	if (delegate_descriptor_id == "") return "";
	const [_, type, ..._rest] = delegate_descriptor_id.split("::");
	const typeVar = type.charAt(0).toUpperCase() + type.slice(1, -1);
	return typeVar;
};

// Copy to clipboard function
const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		console.log("Text copied to clipboard");
		return true;
	} catch (err) {
		console.error("Failed to copy text: ", err);
		return false;
	}
};

const Relationships = ({
	selectedCompany,
	selectedProperty,
	apiKeys,
}: {
	selectedCompany: { id: string; name: string };
	selectedProperty: { id: string; name: string };
	apiKeys: { clientId: string; clientSecret: string; orgId: string } | null;
}) => {
	const [error, setError] = useState<string | null>(null);
	const [rules, setRules] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [rulesLoading, setRulesLoading] = useState(false);
	const [rulesFilter, setRulesFilter] = useState<string>("");
	const [selectedRule, setSelectedRule] = useState<{ id: string; name: string }>({ id: "", name: "" });
	const [ruleComponents, setRuleComponents] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [ruleComponentsLoading, setRuleComponentsLoading] = useState(false);
	const [dataElementsFilter, setDataElementsFilter] = useState<string>("");
	const [searchResults, setSearchResults] = useState<
		{ id: number; matchName: string; typeName: string; delegate_descriptor_id: string; componentId: string }[]
	>([]);
	const [selectedDataElement, setSelectedDataElement] = useState<{ id: string; name: string } | null>(null);
	const [dataElements, setDataElements] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [dataElementsLoading, setDataElementsLoading] = useState(false);
	const [dataElementsSecondFilter, setDataElementsSecondFilter] = useState<string>("");
	const [ruleSearchResults, setRuleSearchResults] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [ruleSearchResultsLoading, setRuleSearchResultsLoading] = useState(false);
	const [rulesSecondFilter, setRulesSecondFilter] = useState<string>("");
	const [arrowColor1, setArrowColor1] = useState<"positive" | "negative" | "informative">("informative");
	const [arrowColor2, setArrowColor2] = useState<"positive" | "negative" | "informative">("informative");

	// Fetch Callbacks
	const fetchRuleComponents = useCallback(
		async (ruleId: string) => {
			try {
				setRuleComponentsLoading(true);
				const response = await fetch("/api/reactor/listcomponentsforrule", {
					method: "POST",
					headers: createApiHeaders(apiKeys),
					body: JSON.stringify({ ruleId }),
				});

				const result: TruncatedReactorAPIResponseItem[] = await response.json();

				if (response.ok) {
					setRuleComponents(result);
				}
			} catch (error) {
				setError("Failed to fetch rule components");
				console.error("Error fetching rule components:", error);
			} finally {
				setRuleComponentsLoading(false);
			}
		},
		[apiKeys]
	);

	const fetchRules = useCallback(
		async (propertyId: string) => {
			try {
				setRulesLoading(true);
				const response = await fetch("/api/reactor/listrules", {
					method: "POST",
					headers: createApiHeaders(apiKeys),
					body: JSON.stringify({ propertyId }),
				});

				const result: TruncatedReactorAPIResponseItem[] = await response.json();

				if (response.ok) {
					setRules(result);
				}
			} catch (error) {
				setError("Failed to fetch rules");
				console.error("Error fetching rules:", error);
			} finally {
				setRulesLoading(false);
			}
		},
		[apiKeys]
	);

	const fetchDataElements = useCallback(
		async (propertyId: string) => {
			try {
				setDataElementsLoading(true);
				const response = await fetch("/api/reactor/listdataelements", {
					method: "POST",
					headers: createApiHeaders(apiKeys),
					body: JSON.stringify({ propertyId }),
				});

				const result: TruncatedReactorAPIResponseItem[] = await response.json();

				if (response.ok) {
					setDataElements(result);
				}
			} catch (error) {
				setError("Failed to fetch data elements");
				console.error("Error fetching data elements:", error);
			} finally {
				setDataElementsLoading(false);
			}
		},
		[apiKeys]
	);

	useEffect(() => {
		setSelectedRule({ id: "", name: "" });
		setRuleComponents([]);
		setRuleComponentsLoading(false);
		setSearchResults([]);
		setRules([]);
		setRulesLoading(false);
		setDataElements([]);
		setDataElementsLoading(false);
		if (selectedProperty.id) {
			fetchRules(selectedProperty.id);
			fetchDataElements(selectedProperty.id);
		}
	}, [selectedProperty, fetchRules, fetchDataElements]);

	// if a rule is selected, fetch its components
	// the components will be used to search for data elements
	useEffect(() => {
		if (selectedRule.id) {
			fetchRuleComponents(selectedRule.id);
		}
	}, [selectedRule, fetchRuleComponents]);

	// Search for data elements in rule component settings
	// when rule component settings change, search for data elements
	useEffect(() => {
		if (ruleComponents.length > 0) {
			// Pattern to match _satellite.getVar('...') contents and %...% patterns
			const pattern = /(_satellite\.getVar\(['"](.*?)['"])|%(.*?)%/g;
			const results = searchComponentSettings(ruleComponents, pattern);
			setSearchResults(
				results.map((result, index) => ({
					id: index,
					matchName: result.matchName,
					typeName: result.typeName,
					delegate_descriptor_id: result.delegate_descriptor_id,
					componentId: result.componentId,
				}))
			);
		}
	}, [ruleComponents]);

	// when data element selected in C List, search for rules
	const handleDataElementSearch = useCallback(async () => {
		setRuleSearchResults([]);
		setRuleSearchResultsLoading(true);
		try {
			const response = await fetch("/api/reactor/searchfordataelement", {
				method: "POST",
				headers: createApiHeaders(apiKeys),
				body: JSON.stringify({
					launchPropertyId: selectedProperty.id,
					dataElementName: selectedDataElement?.name,
				}),
			});

			if (!response.ok) {
				throw new Error("Search failed");
			}

			const data = await response.json();
			setRuleSearchResults(data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setRuleSearchResultsLoading(false);
		}
	}, [selectedProperty.id, selectedDataElement?.name, apiKeys]);

	useEffect(() => {
		if (selectedDataElement) {
			handleDataElementSearch();
		}
	}, [selectedDataElement, handleDataElementSearch]);

	// change arrow colors
	useEffect(() => {
		if (ruleComponentsLoading) {
			setArrowColor1("informative");
			return;
		}
		if (selectedRule.id) {
			if (searchResults.length > 0) {
				setArrowColor1("positive");
			} else {
				setArrowColor1("negative");
			}
		}
	}, [searchResults, ruleComponentsLoading, selectedRule.id]);

	useEffect(() => {
		if (ruleSearchResultsLoading) {
			setArrowColor2("informative");
			return;
		}
		if (selectedDataElement?.id) {
			if (ruleSearchResults.length > 0) {
				setArrowColor2("positive");
			} else {
				setArrowColor2("negative");
			}
		}
	}, [ruleSearchResults, ruleSearchResultsLoading, selectedDataElement?.id]);

	return (
		<Flex direction="column" gap="size-200" minHeight="100vh">
			{error && <ErrorMessage message={error} />}
			<Flex direction="column" gap="size-100">
				<Flex direction="column" gap="size-100" marginBottom="size-200" marginTop="size-200">
					<h3 className="font-bold text-[var(--color-link)]">Find the data elements that are used in a rule</h3>
					<Text UNSAFE_className="mb-3 text-gray-600 dark:text-gray-400 italic font-light">
						Where a rule uses the _satellite.getVar or %syntax% for data elements
					</Text>
					<Flex direction="row" gap="size-200">
						<Flex direction="column" gap="size-100" width="50%">
							<h3>
								<Hammer size="S" /> Rules {rules.length ? `(${rules.length})` : ""}
							</h3>
							<SearchField
								UNSAFE_className="mb-2"
								placeholder="Filter rules..."
								value={rulesFilter}
								onChange={setRulesFilter}
								width="100%"
								marginBottom="size-100"
							/>
							<ListView
								UNSAFE_className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
								width="100%"
								aria-label="Rules"
								maxHeight="size-5000"
								minHeight="size-5000"
								loadingState={rulesLoading ? "loading" : "idle"}
								items={rules.filter((rule) => rule.attributes.name.toLowerCase().includes(rulesFilter.toLowerCase()))}
								renderEmptyState={() => <SelectAProperty searchType="rules" />}
								selectionMode="single"
								selectionStyle="highlight"
								onSelectionChange={(key) => {
									// @ts-expect-error typing issue with react spectrum
									const rule = rules.find((p) => p.id === key?.currentKey);
									setSelectedRule(rule ? { id: rule.id, name: rule.attributes.name } : { id: "", name: "" });
								}}>
								{(item) => (
									<Item>
										{item.attributes.name}
										<Flex gap="size-100" alignItems="center" justifyContent="end" UNSAFE_className="absolute left-[80%]">
											<div
												className="hover:cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm p-1"
												onClick={(e) => {
													e.stopPropagation();
													copyToClipboard(item.attributes.name);
												}}
												title="Copy rule name">
												<Copy size="XS" />
											</div>
											<Link
												className="hover:cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm p-1"
												target="_blank"
												href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${selectedCompany.id}/properties/${selectedProperty.id}/rules/${item.id}`}>
												<LinkOut size="XS" />
											</Link>
										</Flex>
									</Item>
								)}
							</ListView>
						</Flex>
						<Flex justifyContent={"center"} alignItems={"center"}>
							<ArrowRight size="L" color={arrowColor1} />
						</Flex>
						<Flex direction="column" gap="size-100" width="50%">
							<h3>
								<Data size="S" /> Data Elements {searchResults.length ? `(${searchResults.length})` : ""}
							</h3>
							{ruleComponentsLoading && <LoadingSpinner />}
							{!ruleComponentsLoading && (
								<>
									<SearchField
										UNSAFE_className="mb-2"
										placeholder="Filter data elements..."
										value={dataElementsFilter}
										onChange={setDataElementsFilter}
										width="100%"
										marginBottom="size-100"
									/>
									<ListView
										UNSAFE_className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
										width="100%"
										selectionStyle="highlight"
										selectionMode="single"
										maxHeight="size-5000"
										minHeight="size-5000"
										aria-label="Data Elements"
										items={searchResults.filter((item) => item.matchName.toLowerCase().includes(dataElementsFilter.toLowerCase()))}
										renderEmptyState={() => {
											if (selectedRule.name) return <NoResultsMessage searchType="data elements" searchValue={selectedRule.name} />;
											return <SelectARule />;
										}}>
										{(item) => (
											<Item>
												<Text>{item.matchName}</Text>
												<Text slot="description">
													{formatDelegateDescriptorId(item?.delegate_descriptor_id || "")}: {item.typeName}
												</Text>
												<Flex gap="size-100" alignItems="center" justifyContent="end" UNSAFE_className="absolute left-[90%]">
													<div
														className="hover:cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm p-1"
														onClick={(e) => {
															e.stopPropagation();
															copyToClipboard(item.matchName);
														}}
														title="Copy data element name">
														<Copy size="XS" />
													</div>
												</Flex>
											</Item>
										)}
									</ListView>
								</>
							)}
						</Flex>
					</Flex>
				</Flex>

				<Divider size="S" />

				<Flex direction="column" gap="size-100" marginBottom="size-200" marginTop="size-200">
					<h3 className="font-bold text-[var(--color-link)]">Find the rules where a data element is used</h3>
					<Text UNSAFE_className="mb-3 text-[var(--color-text-secondary)] italic font-light">
						Where a data element is referenced in rules by _satellite.getVar or %syntax%
					</Text>
					<Flex direction="row" gap="size-200">
						<Flex direction="column" gap="size-100" width="50%">
							<h3>
								<Data size="S" /> Data Elements {dataElements.length ? `(${dataElements.length})` : ""}
							</h3>
							<SearchField
								UNSAFE_className="mb-2"
								placeholder="Filter data elements..."
								value={dataElementsSecondFilter}
								onChange={setDataElementsSecondFilter}
								width="100%"
								marginBottom="size-100"
							/>
							<ListView
								UNSAFE_className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
								width="100%"
								aria-label="Data Elements 2"
								maxHeight="size-5000"
								minHeight="size-5000"
								loadingState={dataElementsLoading ? "loading" : "idle"}
								items={dataElements.filter((element) => element.attributes.name.toLowerCase().includes(dataElementsSecondFilter.toLowerCase()))}
								renderEmptyState={() => <SelectAProperty searchType="data elements" />}
								selectionMode="single"
								selectionStyle="highlight"
								onSelectionChange={(key) => {
									// @ts-expect-error typing issue with react spectrum
									const dataElement = dataElements.find((p) => p.id === key?.currentKey);
									setSelectedDataElement(dataElement ? { id: dataElement.id, name: dataElement.attributes.name } : { id: "", name: "" });
								}}>
								{(item) => (
									<Item>
										{item.attributes.name}
										<Flex gap="size-100" alignItems="center" justifyContent="end" UNSAFE_className="absolute left-[80%]">
											<div
												className="hover:cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm p-1"
												onClick={(e) => {
													e.stopPropagation();
													copyToClipboard(item.attributes.name);
												}}
												title="Copy data element name">
												<Copy size="XS" />
											</div>
											<Link
												className="hover:cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm p-1"
												target="_blank"
												href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${selectedCompany.id}/properties/${selectedProperty.id}/dataElements/${item.id}`}>
												<LinkOut size="XS" />
											</Link>
										</Flex>
									</Item>
								)}
							</ListView>
						</Flex>
						<Flex justifyContent={"center"} alignItems={"center"}>
							<ArrowRight size="L" color={arrowColor2} />
						</Flex>
						<Flex direction="column" gap="size-100" width="50%">
							<h3>
								<Hammer size="S" /> Rules {ruleSearchResults.length ? `(${ruleSearchResults.length})` : ""}
							</h3>
							{ruleSearchResultsLoading && <LoadingSpinner />}
							{!ruleSearchResultsLoading && (
								<>
									<SearchField
										UNSAFE_className="mb-2"
										placeholder="Filter rules..."
										value={rulesSecondFilter}
										onChange={setRulesSecondFilter}
										width="100%"
										marginBottom="size-100"
									/>
									<ListView
										UNSAFE_className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
										width="100%"
										selectionStyle="highlight"
										selectionMode="single"
										maxHeight="size-5000"
										minHeight="size-5000"
										aria-label="Data Elements"
										items={ruleSearchResults.filter((rule) => rule.attributes.name.toLowerCase().includes(rulesSecondFilter.toLowerCase()))}
										renderEmptyState={() => {
											if (selectedDataElement?.name)
												return <NoResultsMessage searchType="rules" searchValue={selectedDataElement?.name} />;
											return <SelectADataElement />;
										}}>
										{(item) => (
											<Item>
												<Text>{item.attributes.name}</Text>
												<Flex gap="size-100" alignItems="center" justifyContent="end" UNSAFE_className="absolute left-[90%]">
													<div
														className="hover:cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm p-1"
														onClick={(e) => {
															e.stopPropagation();
															copyToClipboard(item.attributes.name);
														}}
														title="Copy rule name">
														<Copy size="XS" />
													</div>
													<Link
														className="hover:cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-sm p-1"
														target="_blank"
														href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${selectedCompany.id}/properties/${selectedProperty.id}/rules/${item.id}`}>
														<LinkOut size="XS" />
													</Link>
												</Flex>
											</Item>
										)}
									</ListView>
								</>
							)}
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default Relationships;
