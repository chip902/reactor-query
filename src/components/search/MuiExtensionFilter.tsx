import React from 'react';
import { Autocomplete, TextField, CircularProgress, Paper, Typography, Stack } from '@mui/material';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';

interface ExtensionFilterProps {
    extensions: TruncatedReactorAPIResponseItem[];
    extensionsLoading: boolean;
    selectedExtension: { id: string; name: string; display_name: string };
    setSelectedExtension: (extension: { id: string; name: string; display_name: string }) => void;
    selectedProperty: { id: string; name: string };
}

const MuiExtensionFilter: React.FC<ExtensionFilterProps> = ({
    extensions,
    extensionsLoading,
    selectedExtension,
    setSelectedExtension,
    selectedProperty,
}) => {
    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Stack spacing={3}>
                <div>
                    <Typography variant="h6" gutterBottom>
                        Extension Filter
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Search for rules and data elements using a specific extension
                    </Typography>
                </div>
                
                <Autocomplete
                    fullWidth
                    value={extensions.find(e => e.id === selectedExtension.id) || null}
                    onChange={(_, newValue) => {
                        if (newValue) {
                            setSelectedExtension({
                                id: newValue.id,
                                name: newValue.attributes.name,
                                display_name: newValue.attributes.display_name || newValue.attributes.name,
                            });
                        } else {
                            setSelectedExtension({ id: '', name: '', display_name: '' });
                        }
                    }}
                    options={extensions}
                    getOptionLabel={(option) => option.attributes.display_name || option.attributes.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    loading={extensionsLoading}
                    disabled={!selectedProperty.id || extensionsLoading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select Extension"
                            required
                            placeholder={extensionsLoading ? 'Loading...' : 'Choose an extension'}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {extensionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </Stack>
        </Paper>
    );
};

export default MuiExtensionFilter;