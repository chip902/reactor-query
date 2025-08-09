import { useState, useEffect } from 'react';
import { UserSettings, ApiKeySet } from '@/lib/types';
import { 
    getApiKeys, 
    hasApiKeys, 
    getApiKeySets, 
    getActiveApiKeySet,
    setActiveApiKeySet as setActiveKey,
    addApiKeySet as addKey,
    updateApiKeySet as updateKey,
    deleteApiKeySet as deleteKey
} from '@/utils/secureStorage';

export const useApiKeys = () => {
    const [apiKeys, setApiKeys] = useState<UserSettings | null>(null);
    const [keySets, setKeySets] = useState<ApiKeySet[]>([]);
    const [activeKeySet, setActiveKeySet] = useState<ApiKeySet | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadKeys = () => {
        const keys = getApiKeys();
        const storage = getApiKeySets();
        const active = getActiveApiKeySet();
        
        setApiKeys(keys);
        setKeySets(storage?.keySets || []);
        setActiveKeySet(active);
        setIsLoading(false);
    };

    useEffect(() => {
        loadKeys();

        // Listen for storage changes
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'cobramist_api_keys_v2' || event.key === 'cobramist_api_keys') {
                loadKeys();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setActiveApiKeySet = (id: string) => {
        setActiveKey(id);
        loadKeys();
    };

    const addApiKeySet = (keySet: Omit<ApiKeySet, 'id' | 'createdAt'>) => {
        const newKey = addKey(keySet);
        loadKeys();
        return newKey;
    };

    const updateApiKeySet = (id: string, updates: Partial<Omit<ApiKeySet, 'id' | 'createdAt'>>) => {
        updateKey(id, updates);
        loadKeys();
    };

    const deleteApiKeySet = (id: string) => {
        deleteKey(id);
        loadKeys();
    };

    return {
        // Backward compatibility
        apiKeys,
        isLoading,
        hasKeys: hasApiKeys(),
        
        // New multi-key support
        keySets,
        activeKeySet,
        setActiveApiKeySet,
        addApiKeySet,
        updateApiKeySet,
        deleteApiKeySet,
        refreshKeys: loadKeys
    };
};