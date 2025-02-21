import { Flex, Button, Text, View } from '@adobe/react-spectrum'
import Data from '@spectrum-icons/workflow/Data';
import Hammer from '@spectrum-icons/workflow/Hammer';
import Calendar from '@spectrum-icons/workflow/Calendar';
import { useAnalytics } from '@/app/hooks/useAnalytics';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';
import { useApiKeys } from '@/app/hooks/useApiKeys';
import { createApiHeaders } from '@/lib/apiUtils';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const downloadCSV = (data: any[], filename: string) => {
    // Get headers from first item's keys
    const headers = Object.keys(data[0]);

    // Create CSV rows
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => headers.map(header =>
            // Wrap values in quotes and escape existing quotes
            `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(','))
    ];

    // Create blob and download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const flattenDataElement = (item: TruncatedReactorAPIResponseItem) => {
    const { id, type, attributes } = item;
    return {
        id,
        type,
        ...attributes
    };
};

const LibraryExport = ({ selectedCompany, selectedProperty }: { selectedCompany: { id: string; name: string }, selectedProperty: { id: string; name: string } }) => {
    const { apiKeys } = useApiKeys();
    const { event } = useAnalytics();
    const [isExporting, setIsExporting] = useState<'data' | 'rules' | 'history' | null>(null);
    return (
        <Flex direction="column" gap="size-300" marginBottom="size-200" marginTop='size-200'>
            <View>
                <Button
                    isDisabled={!selectedCompany.id || !selectedProperty.id || isExporting !== null}
                    variant="accent"
                    UNSAFE_className='hover:cursor-pointer'
                    onPress={async () => {
                        try {
                            setIsExporting('data');
                            event({ action: 'export_data_elements', category: 'engagement', label: 'export_data_elements', value: 1 });
                            if (!apiKeys) throw new Error('No API keys available');

                            const response = await fetch('/api/reactor/listdataelements', {
                                method: 'POST',
                                headers: createApiHeaders(apiKeys),
                                body: JSON.stringify({
                                    propertyId: selectedProperty.id
                                })
                            });
                            if (!response.ok) throw new Error('Failed to fetch data elements');

                            const data: TruncatedReactorAPIResponseItem[] = await response.json();
                            const flattenedData = data.map(flattenDataElement);

                            const filename = `${selectedProperty.name.replace(/\s+/g, '')}_data_elements.csv`;
                            downloadCSV(flattenedData, filename);
                        } catch (error) {
                            console.error('Error exporting data elements:', error);
                        } finally {
                            setIsExporting(null);
                        }
                    }}
                >
                    <Data />
                    <Text>{isExporting === 'data' ? 'Exporting...' : 'Export all Data Elements to CSV'}</Text>
                </Button>
            </View>
            <View>
                <Button
                    isDisabled={!selectedCompany.id || !selectedProperty.id || isExporting !== null}
                    variant="accent"
                    UNSAFE_className='hover:cursor-pointer'
                    onPress={async () => {
                        try {
                            setIsExporting('rules');
                            if (!apiKeys) throw new Error('No API keys available');

                            const response = await fetch('/api/reactor/listrules', {
                                method: 'POST',
                                headers: createApiHeaders(apiKeys),
                                body: JSON.stringify({
                                    propertyId: selectedProperty.id
                                })
                            });
                            if (!response.ok) throw new Error('Failed to fetch rules');

                            const data: TruncatedReactorAPIResponseItem[] = await response.json();
                            const flattenedData = data.map(flattenDataElement);

                            const filename = `${selectedProperty.name.replace(/\s+/g, '')}_rules.csv`;
                            downloadCSV(flattenedData, filename);
                            event({ action: 'export_rules', category: 'engagement', label: 'export_rules', value: 1 });
                        } catch (error) {
                            console.error('Error exporting rules:', error);
                        } finally {
                            setIsExporting(null);
                        }
                    }}
                >
                    <Hammer />
                    <Text>{isExporting === 'rules' ? 'Exporting...' : 'Export all Rules to CSV'}</Text>
                </Button>
            </View>
            <View>
                <Button
                    isDisabled={!selectedCompany.id || !selectedProperty.id || isExporting !== null}
                    variant="accent"
                    UNSAFE_className='hover:cursor-pointer'
                    onPress={async () => {
                        try {
                            setIsExporting('history');
                            if (!apiKeys) throw new Error('No API keys available');

                            const response = await fetch('/api/reactor/listalllibrariesforproperty', {
                                method: 'POST',
                                headers: createApiHeaders(apiKeys),
                                body: JSON.stringify({
                                    propertyId: selectedProperty.id
                                })
                            });
                            if (!response.ok) throw new Error('Failed to fetch libraries');

                            const data: TruncatedReactorAPIResponseItem[] = await response.json();
                            const flattenedData = data.map(flattenDataElement);

                            const filename = `${selectedProperty.name.replace(/\s+/g, '')}_libraries.csv`;
                            downloadCSV(flattenedData, filename);
                            event({ action: 'export_libraries', category: 'engagement', label: 'export_libraries', value: 1 });
                        } catch (error) {
                            console.error('Error exporting publish history:', error);
                        } finally {
                            setIsExporting(null);
                        }
                    }}
                >
                    <Calendar />
                    <Text>{isExporting === 'history' ? 'Exporting...' : 'Export Publish History to CSV'}</Text>
                </Button>
            </View>



        </Flex >
    )
}

export default LibraryExport