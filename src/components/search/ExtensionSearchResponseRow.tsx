"use client";

import { useState } from "react";
import { ExtensionSearchResponseItem } from "@/lib/types";
import formatAttributesWithParsedSettings from "@/lib/formatAttributesWithParsedSettings";
import formatNestedJsonContent from "@/lib/formatNestedJsonContent";

interface ResultItemProps {
	item: ExtensionSearchResponseItem;
	searchValue: string;
	index: number;
	lastSearchedCompany: {
		id: string;
		name: string;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	highlightSearchInJson: (json: any, searchValue: string) => string;
}

const ExtensionSearchResponseRow = ({ item, searchValue, index, highlightSearchInJson, lastSearchedCompany }: ResultItemProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const hasSearchMatch = (json: any, searchValue: string) => {
		if (!searchValue) return false;
		const jsonString = JSON.stringify(json).toLowerCase();
		return jsonString.includes(searchValue.toLowerCase());
	};

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
								href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${lastSearchedCompany.id}/properties/${item.relationships.property.data.id}/extensions/${item.id}`}>
								{item.attributes.name}
							</a>
							{hasSearchMatch(item, searchValue) && <span className="ml-2 text-xs no-underline">🎯</span>}
						</span>
						{item.meta.match_score && (
							<span className="px-2 py-1 text-xs bg-[var(--color-badge-bg)] text-[var(--color-badge-text)] rounded-full">Match Score: {item.meta.match_score.toFixed(2)}</span>
						)}
						<span
							className={`px-2 py-1 text-xs rounded-full ${
								item.attributes.enabled ? "bg-[var(--color-accent-green-bg)] text-[var(--color-accent-green-text)]" : "bg-[var(--color-badge-bg)] text-[var(--color-badge-text)]"
							}`}>
							{item.attributes.enabled ? "Enabled" : "Disabled"}
						</span>
						{item.attributes.deleted_at && <span className="px-2 py-1 text-xs bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red-text)] rounded-full">Deleted</span>}
						<span className="px-2 py-1 text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-full">
							Rev: {item.attributes.revision_number > 0 ? item.attributes.revision_number : "Current"}
						</span>
						<span className="px-2 py-1 text-xs bg-[var(--color-accent-blue-bg)] text-[var(--color-accent-blue-text)] rounded-full">v{item.attributes.version}</span>
					</div>
					<div className="flex items-center space-x-3 text-xs text-[var(--color-text-secondary)]">
						<span>Last Updated: {new Date(item.attributes.updated_at).toLocaleString()}</span>
						<span>By: {item.attributes.updated_by_display_name}</span>
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
					<div className="mb-2 text-sm text-[var(--color-text-secondary)]">ID: {item.id}</div>
					<div className="mt-4">
						<h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Details</h3>
						<pre className="p-4 bg-[var(--color-code-bg)] rounded-lg overflow-x-auto text-sm text-[var(--color-code-text)]">
							<div
								dangerouslySetInnerHTML={{
									__html: highlightSearchInJson(formatNestedJsonContent(formatAttributesWithParsedSettings(item.attributes)), searchValue),
								}}
							/>
						</pre>
					</div>
				</div>
			)}
		</div>
	);
};

export default ExtensionSearchResponseRow;
