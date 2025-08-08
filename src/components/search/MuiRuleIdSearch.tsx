import React from 'react';
import { TextField, Paper, Typography, Stack } from '@mui/material';

interface RuleIdSearchProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
}

const MuiRuleIdSearch: React.FC<RuleIdSearchProps> = ({
    searchValue,
    setSearchValue,
}) => {
    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Stack spacing={3}>
                <div>
                    <Typography variant="h6" gutterBottom>
                        Rule ID Search
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Search for a specific rule by its ID (format: RLxxxxxxxxxxxxxxxx)
                    </Typography>
                </div>
                
                <TextField
                    fullWidth
                    label="Rule ID"
                    placeholder="RL1234567890abcdef..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    variant="outlined"
                    required
                    helperText="Enter a complete rule ID starting with 'RL'"
                />
            </Stack>
        </Paper>
    );
};

export default MuiRuleIdSearch;