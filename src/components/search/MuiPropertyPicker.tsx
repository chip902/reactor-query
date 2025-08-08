import React from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';

interface PropertyPickerProps {
    selectedCompany: { id: string; name: string };
    selectedProperty: { id: string; name: string };
    properties: TruncatedReactorAPIResponseItem[];
    propertiesLoading: boolean;
    setSelectedProperty: (property: { id: string; name: string }) => void;
}

const MuiPropertyPicker: React.FC<PropertyPickerProps> = ({
    selectedCompany,
    selectedProperty,
    properties,
    propertiesLoading,
    setSelectedProperty
}) => {
    return (
        <Autocomplete
            sx={{ minWidth: 300, flex: 1 }}
            value={properties.find(p => p.id === selectedProperty.id) || null}
            onChange={(_, newValue) => {
                if (newValue) {
                    setSelectedProperty({ 
                        id: newValue.id, 
                        name: newValue.attributes.name 
                    });
                } else {
                    setSelectedProperty({ id: '', name: '' });
                }
            }}
            options={properties}
            getOptionLabel={(option) => option.attributes.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={propertiesLoading}
            disabled={!selectedCompany.id || propertiesLoading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Property"
                    required
                    placeholder={propertiesLoading ? 'Loading...' : 'Select a property'}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {propertiesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
};

export default MuiPropertyPicker;