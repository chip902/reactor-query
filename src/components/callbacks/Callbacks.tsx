'use client';
import { useState, useEffect } from 'react';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';
import { createApiHeaders } from '@/lib/apiUtils';
import { Flex, View, Text, Heading, Divider, ProgressCircle } from '@adobe/react-spectrum';
import Link from 'next/link';

const Callbacks = ({ selectedProperty, apiKeys }: {
    selectedProperty: { id: string; name: string },
    apiKeys: { clientId: string; clientSecret: string; orgId: string; } | null
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [callbacks, setCallbacks] = useState<TruncatedReactorAPIResponseItem[]>([]);
    useEffect(() => {
        const fetchCallbacks = async () => {
            if (!selectedProperty.id || !apiKeys) {
                setCallbacks([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/reactor/listcallbacks', {
                    method: 'POST',
                    headers: createApiHeaders(apiKeys),
                    body: JSON.stringify({
                        launchPropertyId: selectedProperty.id
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setCallbacks(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching callbacks');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCallbacks();
    }, [selectedProperty.id, apiKeys]);

    return (
        <Flex direction="column" gap="size-200" minHeight="100vh">
            <Flex direction="column" gap="size-100" marginTop="size-200">
                <Heading level={2} marginBottom="size-100">
                    <Link
                        className='underline text-blue-500 hover:text-blue-700'
                        href="https://experienceleague.adobe.com/en/docs/experience-platform/tags/api/endpoints/callbacks" target='_blank'>
                        Callbacks</Link>
                </Heading>

                {isLoading && (
                    <Flex alignItems="center" justifyContent="center" height="size-800">
                        <ProgressCircle aria-label="Loading callbacks" isIndeterminate />
                    </Flex>
                )}

                {error && (
                    <View marginY="size-200">
                        <Text UNSAFE_className="text-red-600">
                            Error: {error}
                        </Text>
                    </View>
                )}

                {!isLoading && !error && !selectedProperty.id && (
                    <View marginY="size-200">
                        <Text>Select a property to view its callbacks</Text>
                    </View>
                )}

                {!isLoading && !error && selectedProperty.id && callbacks.length === 0 && (
                    <View marginY="size-200">
                        <Text>No callbacks found for this property.</Text>
                    </View>
                )}

                {!isLoading && !error && callbacks.length > 0 && (
                    <View marginY="size-200">
                        {callbacks.map((callback) => (
                            <View
                                key={callback.id}
                                padding="size-200"
                                marginBottom="size-100"
                                UNSAFE_className="border rounded-md bg-white"
                            >
                                <Flex direction="column" gap="size-100">
                                    <Flex justifyContent="space-between" alignItems="center">
                                        <Text><strong>{callback.attributes.url || 'No URL specified'}</strong></Text>
                                        <Text UNSAFE_className="text-sm text-gray-500">
                                            ID: {callback.id}
                                        </Text>
                                    </Flex>

                                    <Divider size="S" />

                                    <Flex direction="column" gap="size-50">
                                        {callback.attributes.subscriptions && callback.attributes.subscriptions.length > 0 ? (
                                            <>
                                                <Text>
                                                    <strong>Subscriptions:</strong>
                                                </Text>
                                                <View
                                                    padding="size-100"
                                                    marginBottom="size-100"
                                                    UNSAFE_className="bg-gray-50 rounded-md"
                                                >
                                                    {callback.attributes.subscriptions.map((subscription: string, index: number) => (
                                                        <Text key={index} UNSAFE_className="text-sm font-mono">
                                                            • {subscription}
                                                        </Text>
                                                    ))}
                                                </View>
                                            </>
                                        ) : (
                                            <Text>
                                                <strong>Subscriptions:</strong> None
                                            </Text>
                                        )}

                                        <Text>
                                            <strong>Created:</strong> {new Date(callback.attributes.created_at).toLocaleString()}
                                        </Text>
                                        <Text>
                                            <strong>Updated:</strong> {new Date(callback.attributes.updated_at).toLocaleString()}
                                        </Text>
                                        <Text>
                                            <strong>Created by:</strong> {callback.attributes.created_by_display_name}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </View>
                        ))}
                    </View>
                )}
            </Flex>
        </Flex>
    );
}

export default Callbacks;