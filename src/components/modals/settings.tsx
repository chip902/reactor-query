import Settings from '@spectrum-icons/workflow/Settings';
import { useState, useEffect } from 'react';
import { UserSettings } from '@/lib/types';
import { Button, ActionButton, ButtonGroup, Dialog, DialogTrigger, Divider, Flex, Form, Header, Heading, Link, TextField, Text, Content } from '@adobe/react-spectrum';
import './styles.css';
import RotateCWBold from '@spectrum-icons/workflow/RotateCWBold';
import { ToastQueue } from '@react-spectrum/toast'

const SettingsModal = () => {
    const [settingsUpdating, setSettingsUpdating] = useState(false);
    const [formData, setFormData] = useState<UserSettings>({
        orgId: '',
        clientId: '',
        clientSecret: '',
    });

    useEffect(() => {
        const storedSettings = sessionStorage.getItem('apiKeys');
        if (storedSettings) {
            setFormData(JSON.parse(storedSettings));
        }
    }, []);

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
            sessionStorage.setItem('apiKeys', JSON.stringify(formData));
            ToastQueue.positive('Settings updated successfully.', { timeout: 3000 });
        } catch (error) {
            console.error('Error updating settings:', error);
            ToastQueue.negative('Failed to update settings.', { timeout: 3000 });
        }

        setSettingsUpdating(false);
    };



    return (
        <DialogTrigger>
            <ActionButton UNSAFE_className='hover:cursor-pointer'>
                <Settings size='S' />
            </ActionButton>
            {
                (close) => (
                    <Dialog>
                        <Heading>
                            <Flex alignItems="center" gap="size-100">
                                <Settings size="S" />
                                <Text>
                                    Settings
                                </Text>
                            </Flex>
                        </Heading>
                        <Header>
                            <Link>
                                <a href="//example.com" target="_blank">How to create your credentials</a>
                            </Link>
                        </Header>
                        <Divider />
                        <Content>
                            <Form onSubmit={handleSubmit}>

                                <TextField label="Organzation ID (orgId)" value={formData.orgId} onChange={(value) => handleChange(value, 'orgId')} />
                                <TextField label="Client ID (clientId)" value={formData.clientId} onChange={(value) => handleChange(value, 'clientId')} />
                                <TextField label="Client Secret (clientSecret)" value={formData.clientSecret} onChange={(value) => handleChange(value, 'clientSecret')} />
                                <ButtonGroup>
                                    <Button variant="secondary" onPress={close}>Cancel</Button>
                                    <Button variant="accent"
                                        type='submit'
                                        isDisabled={settingsUpdating}
                                    >
                                        <Text>&nbsp;{settingsUpdating ? 'Updating Settings...' : 'Update Settings'}</Text>
                                        {settingsUpdating ? <div style={{ animation: 'spin 2s linear infinite' }}>
                                            {" "}<RotateCWBold />
                                        </div> : <></>}</Button>
                                </ButtonGroup>
                            </Form>
                        </Content>
                        {/* <Footer>
                        </Footer> */}

                    </Dialog>
                )
            }
        </DialogTrigger >
    );
}

export default SettingsModal;