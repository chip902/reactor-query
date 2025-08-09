'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Key as KeyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { ApiKeySet } from '@/lib/types';
import { useApiKeys } from '@/app/hooks/useApiKeys';
import { setStoragePreference, getStoragePreference, clearAllApiKeys } from '@/utils/secureStorage';

export default function ApiKeyManager() {
  const {
    keySets,
    activeKeySet,
    setActiveApiKeySet,
    addApiKeySet,
    updateApiKeySet,
    deleteApiKeySet,
    refreshKeys,
  } = useApiKeys();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeySet | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [persistSettings, setPersistSettings] = useState(getStoragePreference());
  const [formData, setFormData] = useState({
    label: '',
    orgId: '',
    clientId: '',
    clientSecret: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingKey) {
      setFormData({
        label: editingKey.label,
        orgId: editingKey.orgId,
        clientId: editingKey.clientId,
        clientSecret: editingKey.clientSecret,
        isDefault: editingKey.isDefault || false,
      });
    } else {
      setFormData({
        label: '',
        orgId: '',
        clientId: '',
        clientSecret: '',
        isDefault: keySets.length === 0,
      });
    }
  }, [editingKey, keySets.length]);

  const handleOpenDialog = (key?: ApiKeySet) => {
    setEditingKey(key || null);
    setDialogOpen(true);
    setErrors({});
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingKey(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }
    if (!formData.orgId.trim()) {
      newErrors.orgId = 'Organization ID is required';
    }
    if (!formData.clientId.trim()) {
      newErrors.clientId = 'Client ID is required';
    }
    if (!formData.clientSecret.trim()) {
      newErrors.clientSecret = 'Client Secret is required';
    }
    
    // Check for duplicate labels
    const isDuplicateLabel = keySets.some(
      k => k.label === formData.label.trim() && k.id !== editingKey?.id
    );
    if (isDuplicateLabel) {
      newErrors.label = 'A key set with this label already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setStoragePreference(persistSettings);

    if (editingKey) {
      updateApiKeySet(editingKey.id, formData);
    } else {
      addApiKeySet(formData);
    }
    
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (keyToDelete) {
      deleteApiKeySet(keyToDelete);
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
    }
  };

  const handleClearAll = () => {
    clearAllApiKeys();
    refreshKeys();
    setClearAllDialogOpen(false);
  };

  const openDeleteDialog = (id: string) => {
    setKeyToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              API Key Management
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Key Set
              </Button>
              {keySets.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setClearAllDialogOpen(true)}
                >
                  Clear All
                </Button>
              )}
            </Stack>
          </Box>

          {keySets.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
              <KeyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No API Keys Configured
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add your first API key set to get started with Adobe Launch Tools
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Your First Key Set
              </Button>
            </Paper>
          ) : (
            <List>
              {keySets.map((keySet) => (
                <React.Fragment key={keySet.id}>
                  <ListItem
                    sx={{
                      bgcolor: activeKeySet?.id === keySet.id ? 'action.selected' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" component="span">
                            {keySet.label}
                          </Typography>
                          {keySet.isDefault && (
                            <Chip
                              size="small"
                              label="Default"
                              color="primary"
                              icon={<StarIcon fontSize="small" />}
                            />
                          )}
                          {activeKeySet?.id === keySet.id && (
                            <Chip
                              size="small"
                              label="Active"
                              color="success"
                              icon={<CheckIcon fontSize="small" />}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Org: {keySet.orgId} • Client: {keySet.clientId.substring(0, 10)}...
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {activeKeySet?.id !== keySet.id && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setActiveApiKeySet(keySet.id)}
                          >
                            Activate
                          </Button>
                        )}
                        <Tooltip title="Edit">
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog(keySet)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            edge="end"
                            onClick={() => openDeleteDialog(keySet.id)}
                            disabled={keySets.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={persistSettings}
                  onChange={(e) => {
                    setPersistSettings(e.target.checked);
                    setStoragePreference(e.target.checked);
                  }}
                />
              }
              label="Store credentials in local storage (persist after browser close)"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              When unchecked, credentials are stored in session storage and cleared when the browser closes
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingKey ? 'Edit API Key Set' : 'Add New API Key Set'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              error={!!errors.label}
              helperText={errors.label || 'A friendly name for this key set (e.g., "Production", "Development")'}
              fullWidth
              required
            />
            <TextField
              label="Organization ID"
              value={formData.orgId}
              onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              error={!!errors.orgId}
              helperText={errors.orgId}
              fullWidth
              required
            />
            <TextField
              label="Client ID"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              error={!!errors.clientId}
              helperText={errors.clientId}
              fullWidth
              required
            />
            <TextField
              label="Client Secret"
              value={formData.clientSecret}
              onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
              error={!!errors.clientSecret}
              helperText={errors.clientSecret}
              type="password"
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label="Set as default key set"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingKey ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete API Key Set</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this API key set? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearAllDialogOpen} onClose={() => setClearAllDialogOpen(false)}>
        <DialogTitle>Clear All API Keys</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will remove all API key sets and make the application unusable until new keys are added.
          </Alert>
          <Typography>
            Are you sure you want to clear all API keys? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}