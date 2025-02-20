'use client'
import { ReactNode } from 'react';
import { useApiKeys } from '@/app/hooks/useApiKeys';
import SettingsAlert from '../modals/SettingsAlert';

interface WithApiKeysProps {
    children: ReactNode;
}

const WithApiKeys = ({ children }: WithApiKeysProps) => {
    const { hasKeys, isLoading } = useApiKeys();

    if (isLoading) {
        return null; // Or a loading spinner if you prefer
    }

    if (!hasKeys) {
        return <SettingsAlert />;
    }

    return <>{children}</>;
};

export default WithApiKeys;
