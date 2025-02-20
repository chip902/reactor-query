'use client';

import { useState } from 'react';
import {
    RuleComponentSearchResponseItem,
} from '@/lib/types';

interface ResultItemProps {
    item: RuleComponentSearchResponseItem;
    searchValue: string;
    index: number;
    searchResource: 'rule_components';
    lastSearchedCompany: {
        id: string;
        name: string;
    };
    organizationName: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    highlightSearchInJson: (json: any, searchValue: string) => string;
}

const RuleComponentSearchResponseRow = ({
    item,
    searchValue,
    index,
    highlightSearchInJson,
}: ResultItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const formattedDate = new Date(item.attributes.updated_at).toLocaleString();
    const [ext, rcType, action] = item.attributes.delegate_descriptor_id.split('::');
    return (
        <div className="w-full border rounded-lg shadow-sm bg-white mb-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
            >
                <div className="flex flex-col space-y-2 w-full sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="font-medium">
                            {index + 1}. {" "}
                            {/* {organizationName ? (
                                <a
                                    target="_blank"
                                    className="text-blue-500 underline hover:text-blue-800"
                                    href={`https://experience.adobe.com/#/@${organizationName}/sname:prod/data-collection/tags/companies/${lastSearchedCompany.id}/properties/${item.relationships.property.data.id}/rules/${item.relationships.rule.data.id}/ruleComponent/${item.id}`}
                                >
                                    {item.attributes.name}
                                </a>
                            ) : (item.attributes.name)} */}
                            {item.attributes.name}
                        </span>
                        {item.meta.match_score && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Match Score: {item.meta.match_score.toFixed(2)}
                            </span>
                        )}
                        <span className="px-2 py-1 text-xs border border-gray-200 rounded-full">
                            Rev: {item.attributes.revision_number > 0 ? item.attributes.revision_number : 'Current'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {ext}
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            {rcType}
                        </span>
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                            {action}
                        </span>
                        {/* {item.attributes.delay_next && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                Delayed
                            </span>
                        )} */}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>Last Updated: {formattedDate}</span>
                    </div>
                </div>

                <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            {isExpanded && (
                <div className="px-4 py-3 border-t">
                    <div className="mb-2 text-sm text-gray-600">
                        ID: {item.id}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
                        <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: highlightSearchInJson(item.attributes, searchValue)
                                }}
                            />
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuleComponentSearchResponseRow;
