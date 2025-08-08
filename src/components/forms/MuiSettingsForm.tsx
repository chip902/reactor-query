'use client'
import { useEffect, useState } from 'react';
import { UserSettings } from '@/lib/types';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Stack,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    CircularProgress,
    Snackbar,
    Box,
} from '@mui/material';
import { Save as SaveIcon, Clear as ClearIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { saveApiKeys, getApiKeys, clearApiKeys, setStoragePreference, getStoragePreference } from '@/utils/secureStorage';

const MuiSettingsForm = () => {
    const [settingsUpdating, setSettingsUpdating] = useState(false);
    const [settingsClearing, setSettingsClearing] = useState(false);
    const [persistSettings, setPersistSettings] = useState(() => {
        return getStoragePreference();
    });
    const [formData, setFormData] = useState<UserSettings>(() => {
        const savedSettings = getApiKeys();
        return savedSettings || {
            orgId: '',
            clientId: '',
            clientSecret: '',
        };
    });
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const isComplete = formData.orgId && formData.clientId && formData.clientSecret;
        setSubmitDisabled(!isComplete);
    }, [formData]);

    const handleChange = (field: keyof UserSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: event.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsUpdating(true);

        try {
            setStoragePreference(persistSettings);
            saveApiKeys(formData);
            setSnackbar({
                open: true,
                message: 'Settings updated successfully.',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update settings.',
                severity: 'error'
            });
        } finally {
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
            setSnackbar({
                open: true,
                message: 'Settings cleared successfully.',
                severity: 'success'
            });
            setClearDialogOpen(false);
        } catch (error) {
            console.error('Error clearing settings:', error);
            setSnackbar({
                open: true,
                message: 'An error occurred while clearing settings.',
                severity: 'error'
            });
        } finally {
            setSettingsClearing(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Card sx={{ maxWidth: 800, mx: 'auto' }}>
                <CardContent>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Launch API Keys
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Configure your Adobe Launch API credentials to access your properties and perform searches.
                    </Typography>
                    
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Organization ID"
                                value={formData.orgId}
                                onChange={handleChange('orgId')}
                                required
                                variant="outlined"
                                helperText="Your Adobe organization ID (format: 1234567890ABCDEF@AdobeOrg)"
                            />
                            
                            <TextField
                                fullWidth
                                label="Client ID"
                                value={formData.clientId}
                                onChange={handleChange('clientId')}
                                required
                                variant="outlined"
                                helperText="Your Adobe I/O Console project's Client ID"
                            />
                            
                            <TextField
                                fullWidth
                                label="Client Secret"
                                type="password"
                                value={formData.clientSecret}
                                onChange={handleChange('clientSecret')}
                                required
                                variant="outlined"
                                helperText="Your Adobe I/O Console project's Client Secret"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={persistSettings}
                                        onChange={(e) => setPersistSettings(e.target.checked)}
                                    />
                                }
                                label="Store my credentials in local storage"
                            />
                            
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    <strong>Storage Options:</strong> By default, credentials are stored in session storage (cleared when browser closes). 
                                    Checking the box above will store them in local storage (persist across browser sessions).
                                </Typography>
                            </Alert>

                            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={settingsUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
                                    disabled={settingsUpdating || submitDisabled}
                                    sx={{ minWidth: 180 }}
                                >
                                    {settingsUpdating ? 'Updating...' : 'Update Settings'}
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="large"
                                    startIcon={settingsClearing ? <RefreshIcon /> : <ClearIcon />}
                                    disabled={settingsClearing}
                                    onClick={() => setClearDialogOpen(true)}
                                >
                                    Clear Settings
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>

            {/* Clear Settings Confirmation Dialog */}
            <Dialog
                open={clearDialogOpen}
                onClose={() => setClearDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Clear Settings
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will clear all your API credentials and settings. You will need to re-enter them to use the application. 
                        Are you sure you want to continue?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearDialogOpen(false)} disabled={settingsClearing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleClearSettings} 
                        color="error" 
                        variant="contained"
                        disabled={settingsClearing}
                        startIcon={settingsClearing ? <CircularProgress size={16} /> : <ClearIcon />}
                    >
                        {settingsClearing ? 'Clearing...' : 'Clear Settings'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MuiSettingsForm;