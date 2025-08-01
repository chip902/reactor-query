"use client";

import { useState, useEffect, useCallback } from "react";
import { RuleSearchResponseItem, RuleComponentSearchResponseItem } from "@/lib/types";
import LoadingSpinner from "../LoadingSpinner";
import { Divider } from "@adobe/react-spectrum";
import formatAttributesWithParsedSettings from "@/lib/formatAttributesWithParsedSettings";
import formatNestedJsonContent from "@/lib/formatNestedJsonContent";
import { useApiKeys } from "@/app/hooks/useApiKeys";
import { createApiHeaders } from "@/lib/apiUtils";

interface ResultItemProps {
	item: RuleSearchResponseItem;
	searchValue: string;
	index: number;
	lastSearchedCompany: {
		id: string;
		name: string;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	highlightSearchInJson: (json: any, searchValue: string) => string;
}

type RuleComponentItem = Pick<RuleComponentSearchResponseItem, "id" | "type" | "attributes">;

const RuleSearchResponseRow = ({ item, searchValue, index, highlightSearchInJson, lastSearchedCompany }: ResultItemProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { attributes } = item;
	const [ruleComponents, setRuleComponents] = useState<RuleComponentItem[]>([]);
	const [ruleComponentsLoading, setRuleComponentsLoading] = useState(false);
	const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
	const [showRuleDetails, setShowRuleDetails] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const hasSearchMatch = (json: any, searchValue: string) => {
		if (!searchValue) return false;
		const jsonString = JSON.stringify(json).toLowerCase();
		return jsonString.includes(searchValue.toLowerCase());
	};

	const toggleComponentExpand = (componentId: string) => {
		setExpandedComponents((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(componentId)) {
				newSet.delete(componentId);
			} else {
				newSet.add(componentId);
			}
			return newSet;
		});
	};

	const groupAndSortComponents = (components: RuleComponentItem[]) => {
		const actions: RuleComponentItem[] = [];
		const conditions: RuleComponentItem[] = [];
		const events: RuleComponentItem[] = [];

		components.forEach((component) => {
			const descriptorId = component.attributes?.delegate_descriptor_id || "";
			if (descriptorId.includes("::actions::")) {
				actions.push(component);
			} else if (descriptorId.includes("::conditions::")) {
				conditions.push(component);
			} else if (descriptorId.includes("::events::")) {
				events.push(component);
			}
		});

		return { actions, conditions, events };
	};

	const renderComponentGroup = (components: RuleComponentItem[], title: string) => {
		if (components.length === 0) return null;

		return (
			<div className="mb-4">
				<h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">{title}</h4>
				<div className="space-y-2">
					{components.map((component) => (
						<div key={component.id} className="p-2 bg-[var(--color-card-secondary)] rounded-md">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-[var(--color-text-primary)] pb-2">
									<a
										target="_blank"
										className="text-[var(--color-link)] underline hover:text-[var(--color-link-hover)]"
										href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${lastSearchedCompany.id}/properties/${item.relationships.property.data.id}/rules/${item.id}/ruleComponent/${component.id}`}>
										{component.attributes.name}
									</a>
									{hasSearchMatch(component.attributes, searchValue) && <span className="ml-2 text-xs">🎯</span>}
								</span>
								<div className="flex items-center space-x-2">
									<span className="text-xs text-[var(--color-text-secondary)]">ID: {component.id}</span>
									<button
										onClick={(e) => {
											e.stopPropagation();
											toggleComponentExpand(component.id);
										}}
										className="p-1 hover:bg-[var(--color-card-hover)] rounded-full transition-colors">
										<svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d={
													expandedComponents.has(component.id)
														? "M5 15l7-7 7 7" // up arrow
														: "M19 9l-7 7-7-7" // down arrow
												}
											/>
										</svg>
									</button>
								</div>
							</div>
							{expandedComponents.has(component.id) && component.attributes && (
								<pre className="mt-2 text-xs overflow-x-auto bg-[var(--color-code-bg)] p-3 rounded whitespace-pre-wrap code-block text-[var(--color-code-text)]">
									<div
										dangerouslySetInnerHTML={{
											__html: highlightSearchInJson(
												formatNestedJsonContent(formatAttributesWithParsedSettings(component.attributes)),
												searchValue
											)
										}}
									/>
								</pre>
							)}
						</div>
					))}
				</div>
			</div>
		);
	};

	const { apiKeys } = useApiKeys();

	const fetchRuleComponents = useCallback(
		async (ruleId: string) => {
			try {
				if (!apiKeys) throw new Error("No API keys available");
				setRuleComponentsLoading(true);

				const response = await fetch("/api/reactor/listcomponentsforrule", {
					method: "POST",
					headers: createApiHeaders(apiKeys),
					body: JSON.stringify({ ruleId }),
				});
				const data = await response.json();
				setRuleComponents(data);
				setRuleComponentsLoading(false);
			} catch (error) {
				console.error("Error fetching rule components:", error);
				setRuleComponentsLoading(false);
			}
		},
		[apiKeys]
	);

	useEffect(() => {
		if (isExpanded) {
			fetchRuleComponents(item.id);
		}
	}, [isExpanded, item.id, fetchRuleComponents]);

	return (
		<div className="w-full border rounded-lg shadow-sm bg-[var(--color-card)] border-[var(--color-border)] mb-2">
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-card-hover)] transition-colors rounded-t-lg">
				<div className="flex flex-col space-y-2 w-full sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
					<div className="flex items-center space-x-3">
						<span className="font-medium">
							{index + 1}.{" "}
							<a
								target="_blank"
								className="text-[var(--color-link)] underline hover:text-[var(--color-link-hover)]"
								href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${lastSearchedCompany.id}/properties/${item.relationships.property.data.id}/rules/${item.id}`}>
								{item.attributes.name}
							</a>
							{hasSearchMatch(item, searchValue) && <span className="ml-2 text-xs no-underline">🎯</span>}
						</span>
						<span
							className={`px-2 py-1 text-xs rounded-full ${
								item.attributes.enabled ? "bg-[var(--color-accent-green-bg)] text-[var(--color-accent-green-text)]" : "bg-[var(--color-badge-bg)] text-[var(--color-badge-text)]"
							}`}>
							{item.attributes.enabled ? "Enabled" : "Disabled"}
						</span>
						{item.attributes.deleted_at && <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Deleted</span>}
						<span className="px-2 py-1 text-xs border border-gray-200 rounded-full">
							Rev: {item.attributes.revision_number > 0 ? item.attributes.revision_number : "Current"}
						</span>
					</div>

					<div className="flex items-center space-x-3 text-xs text-[var(--color-text-secondary)]">
						<span>Last Updated: {new Date(item.attributes.updated_at).toLocaleString()}</span>
						<span>By: {attributes.updated_by_display_name}</span>
					</div>
				</div>

				<svg
					className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{isExpanded && (
				<div className="px-4 py-3 border-t">
					<div className="mb-4">
						Rule Details
						<div className="p-2 bg-[var(--color-card-secondary)] rounded-md">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-[var(--color-text-primary)] pb-2">
									{item.attributes.name}
									{hasSearchMatch(item, searchValue) && <span className="ml-2 text-xs">🎯</span>}
								</span>
								<div className="flex items-center space-x-2">
									<span className="text-xs text-[var(--color-text-secondary)]">ID: {item.id}</span>
									<button
										onClick={() => setShowRuleDetails(!showRuleDetails)}
										className="p-1 hover:bg-[var(--color-card-hover)] rounded-full transition-colors">
										<svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d={
													showRuleDetails
														? "M5 15l7-7 7 7" // up arrow
														: "M19 9l-7 7-7-7" // down arrow
												}
											/>
										</svg>
									</button>
								</div>
							</div>
							{showRuleDetails && (
								<pre className="mt-2 text-xs overflow-x-auto bg-[var(--color-code-bg)] p-3 rounded whitespace-pre-wrap code-block text-[var(--color-code-text)]">
									<div
										dangerouslySetInnerHTML={{
											__html: highlightSearchInJson(
												formatNestedJsonContent(item),
												searchValue
											)
										}}
									/>
								</pre>
							)}
						</div>
					</div>
					<div className="my-4">
						<Divider size="S" />
					</div>
					{ruleComponentsLoading ? (
						<div className="flex items-center justify-center py-8">
							<LoadingSpinner />
						</div>
					) : (
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">Rule Components</h3>
							{ruleComponents.length > 0 ? (
								<div>
									{(() => {
										const { actions, conditions, events } = groupAndSortComponents(ruleComponents);
										return (
											<>
												{renderComponentGroup(events, "Events")}
												{renderComponentGroup(conditions, "Conditions")}
												{renderComponentGroup(actions, "Actions")}
											</>
										);
									})()}
								</div>
							) : (
								<p className="text-sm text-[var(--color-text-secondary)]">No components found for this rule.</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default RuleSearchResponseRow;
