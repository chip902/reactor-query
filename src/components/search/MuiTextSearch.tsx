import React from 'react';
import { TextField, FormControlLabel, Checkbox, Stack, Typography, Paper } from '@mui/material';

interface TextSearchProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    includeRevisionHistory: boolean;
    setIncludeRevisionHistory: (value: boolean) => void;
    includeDeletedItems: boolean;
    setIncludeDeletedItems: (value: boolean) => void;
}

const MuiTextSearch: React.FC<TextSearchProps> = ({
    searchValue,
    setSearchValue,
    includeRevisionHistory,
    setIncludeRevisionHistory,
    includeDeletedItems,
    setIncludeDeletedItems,
}) => {
    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Stack spacing={3}>
                <div>
                    <Typography variant="h6" gutterBottom>
                        Text Search
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Search across rules, data elements, and extensions
                    </Typography>
                </div>
                
                <TextField
                    fullWidth
                    label="Search value"
                    placeholder="Enter search term..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    variant="outlined"
                    required
                />
                
                <Stack direction="row" spacing={3}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeRevisionHistory}
                                onChange={(e) => setIncludeRevisionHistory(e.target.checked)}
                            />
                        }
                        label="Include revision history"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeDeletedItems}
                                onChange={(e) => setIncludeDeletedItems(e.target.checked)}
                            />
                        }
                        label="Include deleted items"
                    />
                </Stack>
            </Stack>
        </Paper>
    );
};

export default MuiTextSearch;