"use client";

import { useState, Suspense } from "react";
import { useApiKeys } from "@/app/hooks/useApiKeys";
import BulkRuleEditor from "@/components/bulk-edit/BulkRuleEditor";
import { useSearchParams } from "next/navigation";

function BulkEditContent() {
	const searchParams = useSearchParams();

	// Get company and property from URL params if available
	const companyId = searchParams.get("companyId");
	const companyName = searchParams.get("companyName");
	const propertyId = searchParams.get("propertyId");
	const propertyName = searchParams.get("propertyName");

	const [selectedCompany, _setSelectedCompany] = useState({
		id: companyId || "",
		name: companyName || "",
	});

	const [selectedProperty, _setSelectedProperty] = useState({
		id: propertyId || "",
		name: propertyName || "",
	});

	const { apiKeys } = useApiKeys();

	return (
		<>
			{apiKeys ? (
				<BulkRuleEditor selectedCompany={selectedCompany} selectedProperty={selectedProperty} apiKeys={apiKeys} />
			) : (
				<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm text-yellow-700">
								Please set up your API keys in the{" "}
								<a href="/settings" className="font-medium underline text-yellow-700 hover:text-yellow-600">
									Settings
								</a>{" "}
								to use the Bulk Edit feature.
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default function BulkEditPage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">Bulk Edit Rules</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<BulkEditContent />
			</Suspense>
		</div>
	);
}
