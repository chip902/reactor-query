'use client';
import { useState, useEffect, useCallback } from 'react';
import { useApiCache } from '@/app/hooks/useApiCache';
import { useApiKeys } from '@/app/hooks/useApiKeys';
import WithApiKeys from '@/components/wrappers/WithApiKeys';
import {
  Button,
  Flex,
  Item,
  Tabs,
  TabList,
  TabPanels,
  Text,
} from "@adobe/react-spectrum";
import type { Key } from '@adobe/react-spectrum';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  DataElementSearchResponseItem,
  ExtensionSearchResponseItem,
  RuleComponentSearchResponseItem,
  RuleSearchResponseItem,
  TruncatedReactorAPIResponseItem,
} from '@/lib/types';
import highlightSearchInJson from '@/lib/highlightSearchInJson';

// Components
import TextSearch from '@/components/search/TextSearch';
import ExtensionFilter from '@/components/search/ExtensionFilter';
import CompanyPicker from '@/components/search/CompanyPicker';
import PropertyPicker from '@/components/search/PropertyPicker';
import SearchError from '@/components/search/SearchError';
import PublishHistory from '@/components/publishhistory/PublishHistory';
import LibraryExport from '@/components/export/LibraryExport';
import DataElementSearchResponseRow from '@/components/search/DataElementSearchResponseRow';
import RuleSearchResponseRow from '@/components/search/RuleSearchResponseRow';
import ExtensionSearchResponseRow from '@/components/search/ExtensionSearchResponseRow';

// Icons
import Download from '@spectrum-icons/workflow/Download';
import Filter from '@spectrum-icons/workflow/Filter';
import Search from '@spectrum-icons/workflow/Search';
import Calendar from '@spectrum-icons/workflow/Calendar';
import Export from '@spectrum-icons/workflow/Export';

type SearchApiResponse =
  | DataElementSearchResponseItem[]
  | RuleComponentSearchResponseItem[]
  | RuleSearchResponseItem[]

const SearchContent = () => {
  const { apiKeys } = useApiKeys();
  const { fetchCompanies, fetchProperties, fetchExtensions } = useApiCache();
  const [companies, setCompanies] = useState<TruncatedReactorAPIResponseItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [properties, setProperties] = useState<TruncatedReactorAPIResponseItem[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [lastSearchedValue, setLastSearchedValue] = useState('');
  const [lastSearchedCompany, setLastSearchedCompany] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [includeRevisionHistory, setIncludeRevisionHistory] = useState(false);
  const [includeDeletedItems, setIncludeDeletedItems] = useState(false);
  const [results, setResults] = useState<{
    data: SearchApiResponse;
    meta: {
      total_hits: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ruleResults, setRuleResults] = useState<RuleSearchResponseItem[]>([]);
  const [dataElementResults, setDataElementResults] = useState<DataElementSearchResponseItem[]>([]);
  const [extensionResults, setExtensionResults] = useState<ExtensionSearchResponseItem[]>([]);
  const [extensions, setExtensions] = useState<TruncatedReactorAPIResponseItem[]>([]);
  const [extensionsLoading, setExtensionsLoading] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<{ id: string; name: string, display_name: string }>({ id: '', name: '', display_name: '' });
  const [lastSearchType, setLastSearchType] = useState<number>(1);
  type Tab = typeof tabs[0];
  const [tabId, setTabId] = useState<Key>(1);
  const loadCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const { data } = await fetchCompanies();
      setCompanies(data);
      // If there's exactly one company, automatically select it
      if (data.length === 1) {
        const company = data[0];
        setSelectedCompany({ id: company.id, name: company.attributes.name });
      }
    } catch (error) {
      setError('Failed to fetch companies');
      console.error(error);
    } finally {
      setCompaniesLoading(false);
    }
  }, [fetchCompanies]);

  const loadProperties = useCallback(async () => {
    if (!selectedCompany.id) return;

    setPropertiesLoading(true);
    try {
      const { data } = await fetchProperties(selectedCompany.id);
      setProperties(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('Failed to fetch properties');
    } finally {
      setPropertiesLoading(false);
    }
  }, [selectedCompany.id, fetchProperties]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (selectedCompany.id) {
      loadProperties();
    } else {
      setProperties([]);
      setSelectedProperty({ id: '', name: '' });
    }
  }, [selectedCompany, loadProperties]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLastSearchedValue(searchValue);
    setLastSearchedCompany(selectedCompany);
    setLastSearchType(Number(tabId));

    try {
      const response = await fetch('/api/reactor/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          launchPropertyId: selectedProperty.id,
          searchValue,
          includeRevisionHistory,
          includeDeletedItems,
          tabId
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
      setRuleResults(data.data.filter((item: RuleSearchResponseItem) => item.type === 'rules'));
      setDataElementResults(data.data.filter((item: DataElementSearchResponseItem) => item.type === 'data_elements'));
      setExtensionResults(data.data.filter((item: ExtensionSearchResponseItem) => item.type === 'extensions'));
      // event({ action: 'search', category: 'engagement', label: 'search', value: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!results?.data) return;

    try {
      const response = await fetch('/api/export-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: results.data,
          resourceType: searchValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CSV');
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `search-results-${searchValue}-${new Date().toISOString()}.csv`;

      // Create a blob from the response
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // You might want to add proper error handling/notification here
    }
  };

  const loadExtensions = useCallback(async () => {
    if (!selectedProperty.id) return;

    setExtensionsLoading(true);
    try {
      const { data } = await fetchExtensions(selectedProperty.id);
      setExtensions(
        data.sort((a, b) =>
          // @ts-expect-error I know it will have a display name
          a.attributes.display_name.localeCompare(b.attributes.display_name)
        )
      );
      setExtensions(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('Failed to fetch extensions');
    } finally {
      setExtensionsLoading(false);
    }
  }, [selectedProperty.id, fetchExtensions]);

  useEffect(() => {
    if (selectedProperty.id) {
      loadExtensions();
    } else {
      setExtensions([]);
      setSelectedExtension({ id: '', name: '', display_name: '' });
    }
  }, [selectedProperty, loadExtensions]);

  useEffect(() => {
    if (selectedExtension.name) {
      setSearchValue(selectedExtension.name);
    }
  }, [selectedExtension]);

  const tabs = [
    {
      id: 1, icon: <Search />, name: 'Text Search',
      children:
        <TextSearch
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          includeRevisionHistory={includeRevisionHistory}
          setIncludeRevisionHistory={setIncludeRevisionHistory}
          includeDeletedItems={includeDeletedItems}
          setIncludeDeletedItems={setIncludeDeletedItems}
        />
    },
    {
      id: 2, icon: <Filter />, name: 'Extension Filter',
      children:
        <ExtensionFilter
          extensions={extensions}
          extensionsLoading={extensionsLoading}
          selectedExtension={selectedExtension}
          setSelectedExtension={setSelectedExtension}
          selectedProperty={selectedProperty}
        />
    },
    {
      id: 3, icon: <Calendar />, name: 'Publish History',
      children:
        <PublishHistory
          selectedCompany={selectedCompany}
          selectedProperty={selectedProperty} />
    },
    {
      id: 4, icon: <Export />, name: 'Export',
      children:
        <LibraryExport
          selectedCompany={selectedCompany}
          selectedProperty={selectedProperty}
        />
    }
  ]

  useEffect(() => {
    setSearchValue('')
    setResults(null)
  }, [tabId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Adobe Launch Search</h1>
      <h2 className="text-lg font-semibold mb-4">Search rules, data elements, and extensions</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <Flex gap="size-150" wrap>
          <CompanyPicker
            companies={companies}
            companiesLoading={companiesLoading}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
          />
          <PropertyPicker
            selectedCompany={selectedCompany}
            selectedProperty={selectedProperty}
            properties={properties}
            propertiesLoading={propertiesLoading}
            setSelectedProperty={setSelectedProperty}
          />
        </Flex>
        <Flex gap="size-150" wrap>
          <Tabs
            aria-label="Search Type Selector"
            items={tabs}
            onSelectionChange={setTabId}
          >
            <TabList>
              {(item: Tab) => (
                <Item>
                  {item.icon}
                  <Text>{item.name}</Text>
                </Item>
              )}
            </TabList>
            <TabPanels>
              {(item: Tab) => (
                <Item>
                  {item.children}
                </Item>
              )}
            </TabPanels>
          </Tabs>
        </Flex>
        {(tabId == 1 || tabId == 2) && (
          <Button
            UNSAFE_className='hover:cursor-pointer'
            UNSAFE_style={{ width: '200px', padding: '1em', fontSize: '1.2em' }}
            variant="accent" type="submit"
            isDisabled={loading || !selectedProperty.id || (!searchValue && tabId == 1) || (!selectedExtension.name && tabId == 2)}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        )}
      </form>

      {/* Results error */}
      {error && <SearchError error={error} />}

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : (
          results && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {lastSearchType === 1
                    ? `${results.meta.total_hits} results found for "${lastSearchedValue}"`
                    : `${results.meta.total_hits} usages found of the ${selectedExtension.display_name} extension`
                  }
                </div>
                {results.data.length > 0 && (
                  <Button
                    variant="secondary"
                    onPress={handleExport}
                  >
                    <Download />
                    <Text>Export to CSV</Text>
                  </Button>
                )}
              </div>
              {ruleResults.length > 0 && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Rules</h1>
                  {ruleResults.map((item, index) => (
                    <RuleSearchResponseRow
                      key={item.id}
                      item={item}
                      searchValue={lastSearchedValue}
                      index={index}
                      highlightSearchInJson={highlightSearchInJson}
                      lastSearchedCompany={lastSearchedCompany}
                    />
                  ))}
                </div>
              )}
              {dataElementResults.length > 0 && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Data Elements</h1>
                  {dataElementResults.map((item, index) => (
                    <DataElementSearchResponseRow
                      key={item.id}
                      item={item}
                      searchValue={lastSearchedValue}
                      index={index}
                      highlightSearchInJson={highlightSearchInJson}
                      lastSearchedCompany={lastSearchedCompany}
                    />
                  ))}
                </div>
              )}
              {extensionResults.length > 0 && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Extensions</h1>
                  {extensionResults.map((item, index) => (
                    <ExtensionSearchResponseRow
                      key={item.id}
                      item={item}
                      searchValue={lastSearchedValue}
                      index={index}
                      highlightSearchInJson={highlightSearchInJson}
                      lastSearchedCompany={lastSearchedCompany}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

const SearchPage = () => {
  return (
    <WithApiKeys>
      <SearchContent />
    </WithApiKeys>
  );
};

export default SearchPage;
