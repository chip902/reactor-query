'use client'
import { useEffect, useState } from 'react';
import { UserSettings } from '@/lib/types';
import { Button, ButtonGroup, Form, TextField, Text, Heading, ActionButton, DialogTrigger, AlertDialog, Checkbox } from '@adobe/react-spectrum';
import './styles.css';
import RotateCWBold from '@spectrum-icons/workflow/RotateCWBold';
import { ToastQueue } from '@react-spectrum/toast';
import { saveApiKeys, getApiKeys, clearApiKeys, setStoragePreference, getStoragePreference } from '@/utils/secureStorage';

const SettingsForm = () => {
    const [settingsUpdating, setSettingsUpdating] = useState(false);
    const [settingsClearing, setSettingsClearing] = useState(false);
    const [persistSettings, setPersistSettings] = useState(() => {
        // Initialize persistence preference from localStorage
        return getStoragePreference();
    });
    const [formData, setFormData] = useState<UserSettings>(() => {
        // Initialize form data from storage
        const savedSettings = getApiKeys();
        return savedSettings || {
            orgId: '',
            clientId: '',
            clientSecret: '',
        };
    });
    const [submitDisabled, setSubmitDisabled] = useState(true);



    useEffect(() => {
        const isComplete = formData.orgId && formData.clientId && formData.clientSecret;
        setSubmitDisabled(!isComplete);
    }, [formData]);

    const handleChange = (value: string, field: keyof UserSettings) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsUpdating(true);

        try {
            // First save the storage preference
            setStoragePreference(persistSettings);
            // Then save the API keys
            saveApiKeys(formData);
            ToastQueue.positive('Settings updated successfully.', { timeout: 3000 });
            setSettingsUpdating(false);
        } catch (error) {
            console.error('Error updating settings:', error);
            ToastQueue.negative('Failed to update settings.', { timeout: 3000 });
            setSettingsUpdating(false);
        }
    };

    const handleClearSettings = () => {
        setSettingsClearing(true);
        try {
            clearApiKeys();
            setFormData({
                orgId: '',
                clientId: '',
                clientSecret: '',
            });
            ToastQueue.positive('Settings cleared successfully.', { timeout: 3000 });
        } catch (error) {
            console.error('Error clearing settings:', error);
            ToastQueue.negative('An error occurred while clearing settings.', { timeout: 3000 });
        } finally {
            setSettingsClearing(false);
        }
    };



    return (
        <Form onSubmit={handleSubmit} UNSAFE_className='space-y-4'>
            <Heading level={2}>Launch API Keys</Heading>
            <TextField
                label="Organization ID"
                value={formData.orgId}
                onChange={(value) => handleChange(value, 'orgId')}
                isRequired
            />
            <TextField
                label="Client ID"
                value={formData.clientId}
                onChange={(value) => handleChange(value, 'clientId')}
                isRequired
            />
            <TextField
                label="Client Secret"
                value={formData.clientSecret}
                onChange={(value) => handleChange(value, 'clientSecret')}
                isRequired
            />

            <Checkbox
                isSelected={persistSettings}
                onChange={setPersistSettings}
                isRequired={false}
            >
                Store my credentials in local storage‡
            </Checkbox>
            <Text UNSAFE_className='text-sm italic'>‡ Checking this box will store your API credentials in your browser&apos;s local storage instead of the default session storage. This will allow your credentials to persist even after the browser is closed.</Text>

            <ButtonGroup UNSAFE_className='pt-2' orientation='horizontal'>
                <Button variant="accent"
                    type='submit'
                    UNSAFE_className='hover:cursor-pointer'
                    UNSAFE_style={{ marginRight: '1rem' }}
                    isDisabled={settingsUpdating || submitDisabled}
                >
                    <Text>&nbsp;{settingsUpdating ? 'Updating Settings...' : 'Update Settings'}</Text>
                    {settingsUpdating ? <div style={{ animation: 'spin 2s linear infinite' }}>
                        {" "}<RotateCWBold />
                    </div> : <></>}
                </Button>
                <DialogTrigger>
                    <ActionButton
                        id='clear-settings-button'
                        UNSAFE_style={{ borderRadius: '16px' }}
                        isDisabled={settingsClearing}
                    >Clear Settings</ActionButton>
                    <AlertDialog
                        variant="destructive"
                        title="Clear Settings"
                        primaryActionLabel="Clear Settings"
                        isPrimaryActionDisabled={settingsClearing}
                        onPrimaryAction={handleClearSettings}
                        cancelLabel="Cancel">
                        This will clear all your settings and make the app unusable. Continue?
                    </AlertDialog>
                </DialogTrigger>
            </ButtonGroup>
        </Form>
    );
}

export default SettingsForm;