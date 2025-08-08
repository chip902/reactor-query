import React from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';

interface CompanyPickerProps {
    companies: TruncatedReactorAPIResponseItem[];
    companiesLoading: boolean;
    selectedCompany: { id: string; name: string };
    setSelectedCompany: (company: { id: string; name: string }) => void;
}

const MuiCompanyPicker: React.FC<CompanyPickerProps> = ({
    companies,
    companiesLoading,
    selectedCompany,
    setSelectedCompany
}) => {
    return (
        <Autocomplete
            sx={{ minWidth: 300, flex: 1 }}
            value={companies.find(c => c.id === selectedCompany.id) || null}
            onChange={(_, newValue) => {
                if (newValue) {
                    setSelectedCompany({ 
                        id: newValue.id, 
                        name: newValue.attributes.name 
                    });
                } else {
                    setSelectedCompany({ id: '', name: '' });
                }
            }}
            options={companies}
            getOptionLabel={(option) => option.attributes.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={companiesLoading}
            disabled={companiesLoading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Company"
                    required
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {companiesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
};

export default MuiCompanyPicker;