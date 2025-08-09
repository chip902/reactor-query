import { UserSettings, ApiKeySet, ApiKeysStorage } from '@/lib/types';

const STORAGE_KEY = 'cobramist_api_keys';
const STORAGE_KEY_V2 = 'cobramist_api_keys_v2';
const STORAGE_TYPE_KEY = 'cobramist_storage_type';
const isClient = typeof window !== 'undefined';
const isDev = process.env.NODE_ENV === 'development';

// Helper function to safely log errors without exposing sensitive data
const logError = (message: string, error?: unknown) => {
    if (isDev && error instanceof Error) {
        // In development, log the error message but not the full error object
        console.error(`${message}: ${error.message}`);
    } else {
        // In production, only log generic messages
        console.error(message);
    }
};

// Simple encryption/decryption using Base64
const encrypt = (text: string): string => {
    // Use Buffer for consistent Base64 encoding across client/server
    return Buffer.from(text).toString('base64');
};

const decrypt = (text: string): string => {
    // Decode Base64 using Buffer
    return Buffer.from(text, 'base64').toString();
};

// Get the storage object to use (localStorage or sessionStorage)
const getStorageType = (): Storage => {
    if (!isClient) return null as unknown as Storage;
    
    // Check if we should use localStorage (persistent storage)
    const useLocalStorage = localStorage.getItem(STORAGE_TYPE_KEY) === 'true';
    return useLocalStorage ? localStorage : sessionStorage;
};

// Set storage preference
export const setStoragePreference = (useLocalStorage: boolean): void => {
    if (!isClient) return;
    try {
        localStorage.setItem(STORAGE_TYPE_KEY, useLocalStorage.toString());
    } catch {
        logError('Failed to save storage preference');
    }
};

// Get storage preference
export const getStoragePreference = (): boolean => {
    if (!isClient) return false;
    return localStorage.getItem(STORAGE_TYPE_KEY) === 'true';
};

// Generate a unique ID for a key set
const generateKeyId = (): string => {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Migrate from v1 to v2 format
const migrateFromV1ToV2 = (): void => {
    if (!isClient) return;
    
    try {
        // Check both storages for v1 data
        let v1Data: UserSettings | null = null;
        let encryptedData = localStorage.getItem(STORAGE_KEY);
        
        if (!encryptedData) {
            encryptedData = sessionStorage.getItem(STORAGE_KEY);
        }
        
        if (encryptedData) {
            const decryptedData = decrypt(encryptedData);
            v1Data = JSON.parse(decryptedData);
        }
        
        if (v1Data && v1Data.clientId && v1Data.clientSecret && v1Data.orgId) {
            // Create new v2 format with the existing key as "Default"
            const keySet: ApiKeySet = {
                id: generateKeyId(),
                label: 'Default',
                orgId: v1Data.orgId,
                clientId: v1Data.clientId,
                clientSecret: v1Data.clientSecret,
                isDefault: true,
                createdAt: new Date().toISOString(),
                organizationName: v1Data.organizationName
            };
            
            const v2Data: ApiKeysStorage = {
                keySets: [keySet],
                activeKeyId: keySet.id
            };
            
            // Save in v2 format
            const storage = getStorageType();
            const encryptedV2Data = encrypt(JSON.stringify(v2Data));
            storage.setItem(STORAGE_KEY_V2, encryptedV2Data);
            
            // Clear v1 data
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
        }
    } catch (error) {
        logError('Failed to migrate from v1 to v2', error);
    }
};

// Get all API key sets
export const getApiKeySets = (): ApiKeysStorage | null => {
    if (!isClient) return null;
    
    // First attempt migration if needed
    migrateFromV1ToV2();
    
    try {
        // Try to get v2 data
        let encryptedData = localStorage.getItem(STORAGE_KEY_V2);
        
        if (!encryptedData) {
            encryptedData = sessionStorage.getItem(STORAGE_KEY_V2);
        }
        
        if (!encryptedData) return null;
        
        const decryptedData = decrypt(encryptedData);
        return JSON.parse(decryptedData);
    } catch {
        logError('Failed to retrieve API key sets');
        return null;
    }
};

// Save all API key sets
export const saveApiKeySets = (keySets: ApiKeysStorage): void => {
    if (!isClient) return;
    try {
        const storage = getStorageType();
        const encryptedData = encrypt(JSON.stringify(keySets));
        storage.setItem(STORAGE_KEY_V2, encryptedData);
    } catch {
        logError('Failed to save API key sets');
        throw new Error('Failed to save API key sets');
    }
};

// Add a new API key set
export const addApiKeySet = (keySet: Omit<ApiKeySet, 'id' | 'createdAt'>): ApiKeySet => {
    const newKeySet: ApiKeySet = {
        ...keySet,
        id: generateKeyId(),
        createdAt: new Date().toISOString()
    };
    
    const storage = getApiKeySets() || { keySets: [], activeKeyId: null };
    
    // If this is the first key or marked as default, set it as active
    if (storage.keySets.length === 0 || keySet.isDefault) {
        storage.activeKeyId = newKeySet.id;
        // Remove default from other keys if this is default
        if (keySet.isDefault) {
            storage.keySets.forEach(k => k.isDefault = false);
        }
    }
    
    storage.keySets.push(newKeySet);
    saveApiKeySets(storage);
    
    return newKeySet;
};

// Update an existing API key set
export const updateApiKeySet = (id: string, updates: Partial<Omit<ApiKeySet, 'id' | 'createdAt'>>): void => {
    const storage = getApiKeySets();
    if (!storage) return;
    
    const keyIndex = storage.keySets.findIndex(k => k.id === id);
    if (keyIndex === -1) return;
    
    // If setting as default, remove default from others
    if (updates.isDefault) {
        storage.keySets.forEach(k => k.isDefault = false);
    }
    
    storage.keySets[keyIndex] = {
        ...storage.keySets[keyIndex],
        ...updates
    };
    
    saveApiKeySets(storage);
};

// Delete an API key set
export const deleteApiKeySet = (id: string): void => {
    const storage = getApiKeySets();
    if (!storage) return;
    
    storage.keySets = storage.keySets.filter(k => k.id !== id);
    
    // If we deleted the active key, set a new active key
    if (storage.activeKeyId === id) {
        storage.activeKeyId = storage.keySets.length > 0 ? storage.keySets[0].id : null;
    }
    
    saveApiKeySets(storage);
};

// Get the active API key set
export const getActiveApiKeySet = (): ApiKeySet | null => {
    const storage = getApiKeySets();
    if (!storage || !storage.activeKeyId) return null;
    
    return storage.keySets.find(k => k.id === storage.activeKeyId) || null;
};

// Set the active API key set
export const setActiveApiKeySet = (id: string): void => {
    const storage = getApiKeySets();
    if (!storage) return;
    
    if (storage.keySets.find(k => k.id === id)) {
        storage.activeKeyId = id;
        saveApiKeySets(storage);
    }
};

// Clear all API keys
export const clearAllApiKeys = (): void => {
    if (!isClient) return;
    try {
        // Clear from both storage types to ensure complete cleanup
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY_V2);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY_V2);
    } catch {
        logError('Failed to clear API keys');
        throw new Error('Failed to clear API keys');
    }
};

// BACKWARD COMPATIBILITY FUNCTIONS
// These maintain compatibility with existing code

export const saveApiKeys = (settings: UserSettings): void => {
    // Convert to new format and save
    const storage = getApiKeySets() || { keySets: [], activeKeyId: null };
    
    // If there's an active key, update it; otherwise create a new one
    if (storage.activeKeyId) {
        const activeKey = storage.keySets.find(k => k.id === storage.activeKeyId);
        if (activeKey) {
            updateApiKeySet(storage.activeKeyId, {
                orgId: settings.orgId,
                clientId: settings.clientId,
                clientSecret: settings.clientSecret,
                organizationName: settings.organizationName
            });
        }
    } else {
        addApiKeySet({
            label: 'Default',
            orgId: settings.orgId,
            clientId: settings.clientId,
            clientSecret: settings.clientSecret,
            isDefault: true,
            organizationName: settings.organizationName
        });
    }
};

export const getApiKeys = (): UserSettings | null => {
    const activeKey = getActiveApiKeySet();
    if (!activeKey) return null;
    
    return {
        orgId: activeKey.orgId,
        clientId: activeKey.clientId,
        clientSecret: activeKey.clientSecret,
        organizationName: activeKey.organizationName
    };
};

export const clearApiKeys = clearAllApiKeys;

// Utility function to check if API keys are set
export const hasApiKeys = (): boolean => {
    const keys = getApiKeys();
    return !!(keys?.clientId && keys?.clientSecret && keys?.orgId);
};