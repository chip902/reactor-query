'use client';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CalendarItem } from '@/lib/types';
import { useAsyncList } from '@adobe/react-spectrum';
import { format } from 'date-fns';

// Components
import Link from 'next/link';
import { MonthViewCalendar } from '@/components/publishhistory/MonthViewCalendar';
import { Flex, Item, Text, ListView, View } from "@adobe/react-spectrum";

const PublishHistory = ({ selectedCompany, selectedProperty, apiKeys }: {
    selectedCompany: { id: string; name: string },
    selectedProperty: { id: string; name: string },
    apiKeys: { clientId: string; clientSecret: string; orgId: string; } | null
}) => {
    const [nextPage, setNextPage] = useState(0);
    const libraries = useAsyncList<CalendarItem>({
        async load({ signal, cursor }) {
            if (!selectedProperty.id || !apiKeys) {
                return {
                    items: [],
                    cursor: null
                };
            }

            try {
                const pageNumber = cursor ? parseInt(cursor) : 1;

                const response = await fetch('/api/reactor/listlibrariesforproperty', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-keys': JSON.stringify({
                            clientId: apiKeys.clientId,
                            clientSecret: apiKeys.clientSecret,
                            orgId: apiKeys.orgId
                        })
                    },
                    body: JSON.stringify({
                        propertyId: selectedProperty.id,
                        pageNumber,
                        pageSize: 25,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    }),
                    signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const json = await response.json();
                const nextCursor = json.meta?.pagination?.next_page?.toString() || null;
                setNextPage(nextCursor);

                return {
                    items: json.data || [],
                    cursor: nextCursor
                };
            } catch (error) {
                // If the error is an AbortError, return empty result instead of throwing
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return {
                        items: [],
                        cursor: null
                    };
                }
                console.error('Error loading libraries:', error);
                throw error;
            }
        },
        initialSortDescriptor: undefined,
        getKey: (item) => item.id
    });
    const [currentDate, setCurrentDate] = useState(new Date());

    // Reload libraries when property changes
    useEffect(() => {
        if (selectedProperty.id) {
            libraries.reload();
        } else {
            libraries.setSelectedKeys(new Set());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProperty.id]);

    useEffect(() => {
        if (!nextPage && nextPage === null) {
            libraries.append({
                id: 'end-of-publish-history',
                attributes: {
                    name: `End of Publish History`,
                    state: 'published',
                    created_by_display_name: 'Fake',
                    published_at: new Date().toISOString(),
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextPage]);

    return (
        <Flex direction="column" gap="size-100" marginBottom="size-200" marginTop='size-200'>
            {(!apiKeys || libraries.isLoading) && <LoadingSpinner />}
            {apiKeys && !libraries.isLoading && !selectedProperty.id && (
                <p>Select a property to view its publish history.</p>
            )}
            {apiKeys && !libraries.isLoading && selectedProperty.id && libraries.items.length === 0 && (
                <p>No publish history found for this property.</p>
            )}
            {libraries.items.length > 0 && (
                <Flex direction="column" gap="size-200">
                    <Flex direction="row" gap="size-100">
                        <View
                            width="60%"
                            maxHeight="size-6000"
                            minHeight="size-6000">
                            <p className="mb-2">
                                <span className="font-bold">Current:</span>
                                <Link
                                    target="_blank"
                                    className="text-blue-500 underline hover:text-blue-800 font-regular"
                                    href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${selectedCompany.id}/properties/${selectedProperty.id}/publishing/${libraries.items[0].id}`}
                                >
                                    {" "}{libraries.items[0].attributes.name}
                                </Link>
                                {" "}on {libraries.items[0].attributes.published_at && format(new Date(libraries.items[0].attributes.published_at), 'MMMM do, yyyy h:mm:ss a')}
                            </p>
                            <MonthViewCalendar
                                items={libraries.items}
                                currentDate={currentDate}
                                onDateChange={setCurrentDate}
                            />
                        </View>
                        <View width="40%">
                            <p className="font-bold mb-2">Publish History</p>
                            <ListView
                                UNSAFE_style={{ backgroundColor: 'white' }}
                                width="100%"
                                aria-label="Rules"
                                maxHeight="size-6000"
                                minHeight="size-6000"
                                loadingState={libraries.loadingState}
                                items={libraries.items}
                                onLoadMore={libraries.loadMore}
                                selectionMode="single"
                                selectionStyle="highlight"
                            >
                                {(item) => {
                                    if (item.id === 'end-of-publish-history') {
                                        return (
                                            <Item key={item.id} textValue={item.attributes.name}>
                                                <Text justifySelf={'center'} UNSAFE_className='font-bold'>
                                                    Start of Publish History!
                                                </Text>
                                            </Item>
                                        )
                                    } else {
                                        return (
                                            <Item key={item.id} textValue={item.attributes.name}>
                                                <Text justifySelf={'start'}>
                                                    <Link target="_blank" className="text-blue-500 underline hover:text-blue-800" href={`https://experience.adobe.com/#/@organizationName/sname:prod/data-collection/tags/companies/${selectedCompany.id}/properties/${selectedProperty.id}/publishing/${item.id}`}>
                                                        {item.attributes.name.slice(0, 35)}{item.attributes.name.length > 35 && '...'}
                                                    </Link>
                                                </Text>
                                                <Text justifySelf={'end'}>{item.attributes.published_at && format(new Date(item.attributes.published_at), 'MM/dd/yy h:mm:ss a')}</Text>
                                            </Item>
                                        )
                                    }
                                }
                                }
                            </ListView>
                        </View>
                    </Flex>
                </Flex>
            )
            }
        </Flex >
    )
}
export default PublishHistory;