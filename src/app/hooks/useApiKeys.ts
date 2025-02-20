import { useState, useEffect } from 'react';
import { UserSettings } from '@/lib/types';
import { getApiKeys, hasApiKeys } from '@/utils/secureStorage';

export const useApiKeys = () => {
    const [apiKeys, setApiKeys] = useState<UserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadApiKeys = () => {
            const keys = getApiKeys();
            setApiKeys(keys);
            setIsLoading(false);
        };

        loadApiKeys();

        // Listen for storage changes
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cobramist_api_keys') {
                loadApiKeys();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return {
        apiKeys,
        isLoading,
        hasKeys: hasApiKeys()
    };
};
