'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Stack,
  LinearProgress,
  Collapse,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  CallSplit as CallSplitIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';
import { createApiHeaders } from '@/lib/api-utils';
import formatAttributesWithParsedSettings from '@/lib/formatAttributesWithParsedSettings';
import formatNestedJsonContent from '@/lib/formatNestedJsonContent';
import { useApiKeys } from '@/app/hooks/useApiKeys';

interface PropertyScannerProps {
  apiKeys?: {
    clientId: string;
    clientSecret: string;
    orgId: string;
  };
}

interface ScanResult {
  property: {
    id: string;
    name?: string;
  };
  rules: {
    total: number;
    byExecutionOrder: {
      pageLoad: {
        libraryLoaded: RuleWithComponents[];
        pageBottom: RuleWithComponents[];
        windowLoaded: RuleWithComponents[];
        domReady: RuleWithComponents[];
      };
      directCall: RuleWithComponents[];
      customEvents: Record<string, RuleWithComponents[]>;
    };
    all: RuleWithComponents[];
  };
  dataElements?: {
    total: number;
    items: TruncatedReactorAPIResponseItem[];
  };
  scanTimestamp: string;
}

interface RuleWithComponents extends TruncatedReactorAPIResponseItem {
  components?: TruncatedReactorAPIResponseItem[];
  attributes: TruncatedReactorAPIResponseItem['attributes'] & {
    enabled?: boolean;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scanner-tabpanel-${index}`}
      aria-labelledby={`scanner-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PropertyScanner({ apiKeys: propsApiKeys }: PropertyScannerProps) {
  const { keySets, activeKeySet, setActiveApiKeySet, apiKeys: hookApiKeys } = useApiKeys();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<TruncatedReactorAPIResponseItem[]>([]);
  const [properties, setProperties] = useState<TruncatedReactorAPIResponseItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<TruncatedReactorAPIResponseItem | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<TruncatedReactorAPIResponseItem | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [expandedDataElements, setExpandedDataElements] = useState<Set<string>>(new Set());
  
  // Use props API keys if provided, otherwise use the active key from the hook
  const apiKeys = propsApiKeys || hookApiKeys;
  const hasMultipleKeys = keySets.length > 1;

  // Load companies when component mounts or active key changes
  useEffect(() => {
    if (apiKeys) {
      loadCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKeySet?.id]);

  const loadCompanies = async () => {
    if (!apiKeys) {
      setError('No API keys configured');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setCompanies([]);
      setProperties([]);
      setSelectedCompany(null);
      setSelectedProperty(null);
      setScanResult(null);
      
      const response = await fetch('/api/reactor/listcompanies', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
      });
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async (companyId: string) => {
    if (!apiKeys) {
      setError('No API keys configured');
      return;
    }
    
    try {
      const response = await fetch('/api/reactor/listproperties', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
        body: JSON.stringify({ companyId }),
      });
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Failed to load properties');
    }
  };

  const handleCompanyChange = async (company: TruncatedReactorAPIResponseItem | null) => {
    setSelectedCompany(company);
    setSelectedProperty(null);
    setScanResult(null);
    if (company) {
      await loadProperties(company.id);
    } else {
      setProperties([]);
    }
  };

  const handleKeyChange = (event: SelectChangeEvent) => {
    const keyId = event.target.value;
    setActiveApiKeySet(keyId);
  };

  const handleScan = async () => {
    if (!selectedProperty || !apiKeys) return;

    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/reactor/scanproperty', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          includeDataElements: true,
          includeRuleComponents: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      data.property.name = selectedProperty.attributes.name;
      setScanResult(data);
      setTabValue(0);
    } catch (err) {
      console.error('Scan failed:', err);
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleExpansion = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  const toggleComponentExpansion = (componentId: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedComponents(newExpanded);
  };

  const toggleDataElementExpansion = (dataElementId: string) => {
    const newExpanded = new Set(expandedDataElements);
    if (newExpanded.has(dataElementId)) {
      newExpanded.delete(dataElementId);
    } else {
      newExpanded.add(dataElementId);
    }
    setExpandedDataElements(newExpanded);
  };

  const filterRules = (rules: RuleWithComponents[]) => {
    if (!searchQuery) return rules;
    return rules.filter(rule => 
      rule.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderComponentGroup = (components: TruncatedReactorAPIResponseItem[], title: string, icon: React.ReactNode, color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' = 'primary') => {
    if (components.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          {icon}
          {title} ({components.length})
        </Typography>
        <Stack spacing={2}>
          {components.map(comp => {
            const isExpanded = expandedComponents.has(comp.id);
            const [extension, type, action] = comp.attributes.delegate_descriptor_id?.split('::') || [];
            
            return (
              <Paper key={comp.id} sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {comp.attributes.name}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label={`ID: ${comp.id}`} size="small" variant="outlined" />
                      {extension && <Chip label={extension} size="small" color="info" />}
                      {type && <Chip label={type} size="small" color={color} variant="outlined" />}
                      {action && <Chip label={action} size="small" color="secondary" />}
                    </Stack>
                  </Box>
                  <IconButton onClick={() => toggleComponentExpansion(comp.id)} size="small">
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                
                <Collapse in={isExpanded}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      Component Details
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        backgroundColor: (theme) => theme.palette.mode === 'dark' 
                          ? 'grey.900' 
                          : 'grey.50',
                        border: '1px solid',
                        borderColor: 'divider',
                        maxHeight: 400,
                        overflow: 'auto'
                      }}
                    >
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '0.75rem', 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        color: 'inherit'
                      }}>
                        {JSON.stringify(formatNestedJsonContent(formatAttributesWithParsedSettings(comp.attributes)), null, 2)}
                      </pre>
                    </Paper>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(comp.attributes.created_at).toLocaleString()}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Updated: {new Date(comp.attributes.updated_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    );
  };

  const renderDataElementCard = (dataElement: TruncatedReactorAPIResponseItem) => {
    const isExpanded = expandedDataElements.has(dataElement.id);
    const [extension, type] = dataElement.attributes.delegate_descriptor_id?.split('::') || [];

    return (
      <Card key={dataElement.id} sx={{ mb: 2, elevation: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {dataElement.attributes.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip 
                  label={`ID: ${dataElement.id}`} 
                  size="small" 
                  variant="outlined"
                />
                {extension && <Chip label={extension} size="small" color="info" />}
                {type && <Chip label={type} size="small" color="primary" variant="outlined" />}
                <Chip 
                  label={`Rev: ${'revision_number' in dataElement.attributes ? dataElement.attributes.revision_number : 'Current'}`} 
                  size="small" 
                  variant="outlined"
                />
              </Stack>
            </Box>
            <IconButton onClick={() => toggleDataElementExpansion(dataElement.id)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            
            {/* Data Element Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                <StorageIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Data Element Information
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {dataElement.attributes.delegate_descriptor_id && (
                  <Chip 
                    label={`Type: ${dataElement.attributes.delegate_descriptor_id.split('::').pop()}`} 
                    size="small" 
                    color="secondary"
                  />
                )}
                {'enabled' in dataElement.attributes && (
                  <Chip 
                    label={dataElement.attributes.enabled === false ? 'Disabled' : 'Enabled'} 
                    size="small" 
                    color={dataElement.attributes.enabled === false ? 'warning' : 'success'}
                  />
                )}
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(dataElement.attributes.created_at).toLocaleString()}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Updated: {new Date(dataElement.attributes.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* Data Element JSON Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Configuration Details
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'grey.900' 
                    : 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                  maxHeight: 400,
                  overflow: 'auto'
                }}
              >
                <pre style={{ 
                  margin: 0, 
                  fontSize: '0.75rem', 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  color: 'inherit'
                }}>
                  {JSON.stringify(formatNestedJsonContent(formatAttributesWithParsedSettings(dataElement.attributes)), null, 2)}
                </pre>
              </Paper>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const renderRuleCard = (rule: RuleWithComponents) => {
    const isExpanded = expandedRules.has(rule.id);
    const eventComponents = rule.components?.filter(c => 
      c.attributes.delegate_descriptor_id?.includes('::events::')
    ) || [];
    const conditionComponents = rule.components?.filter(c => 
      c.attributes.delegate_descriptor_id?.includes('::conditions::')
    ) || [];
    const actionComponents = rule.components?.filter(c => 
      c.attributes.delegate_descriptor_id?.includes('::actions::')
    ) || [];

    return (
      <Card key={rule.id} sx={{ mb: 2, elevation: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {rule.attributes.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip 
                  label={`ID: ${rule.id}`} 
                  size="small" 
                  variant="outlined"
                />
                {rule.attributes.enabled === false && (
                  <Chip 
                    label="Disabled" 
                    size="small" 
                    color="warning"
                  />
                )}
                <Chip 
                  label={`${rule.components?.length || 0} components`} 
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Box>
            <IconButton onClick={() => toggleRuleExpansion(rule.id)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            
            {/* Rule Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Rule Information
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip 
                  label={rule.attributes.enabled ? 'Enabled' : 'Disabled'} 
                  size="small" 
                  color={rule.attributes.enabled ? 'success' : 'warning'}
                />
                <Chip 
                  label={`Rev: ${'revision_number' in rule.attributes ? rule.attributes.revision_number : 'Current'}`} 
                  size="small" 
                  variant="outlined"
                />
              </Stack>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(rule.attributes.created_at).toLocaleString()}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Updated: {new Date(rule.attributes.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* Rule Components */}
            {renderComponentGroup(
              eventComponents, 
              'Events', 
              <ScheduleIcon sx={{ fontSize: 16, mr: 1 }} />,
              'info'
            )}
            
            {renderComponentGroup(
              conditionComponents, 
              'Conditions', 
              <CallSplitIcon sx={{ fontSize: 16, mr: 1 }} />,
              'secondary'
            )}
            
            {renderComponentGroup(
              actionComponents, 
              'Actions', 
              <PlayArrowIcon sx={{ fontSize: 16, mr: 1 }} />,
              'success'
            )}
            
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const renderExecutionOrderTab = () => {
    if (!scanResult) return null;
    const { pageLoad, directCall, customEvents } = scanResult.rules.byExecutionOrder;

    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Page Load Rules (Execution Order)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Rules execute in this sequence: Library Loaded → Page Bottom → Window Loaded → DOM Ready
          </Typography>
          
          {Object.entries(pageLoad).map(([phase, rules]) => (
            <Box key={phase} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {phase.replace(/([A-Z])/g, ' $1').trim()} ({filterRules(rules).length})
              </Typography>
              {filterRules(rules).length > 0 ? (
                filterRules(rules).map(rule => renderRuleCard(rule))
              ) : (
                <Typography variant="body2" color="text.secondary">No rules in this phase</Typography>
              )}
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Direct Call Rules ({filterRules(directCall).length})
          </Typography>
          {filterRules(directCall).length > 0 ? (
            filterRules(directCall).map(rule => renderRuleCard(rule))
          ) : (
            <Typography variant="body2" color="text.secondary">No direct call rules</Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            <CallSplitIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Custom Event Rules
          </Typography>
          {Object.entries(customEvents).map(([eventType, rules]) => (
            <Box key={eventType} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {eventType} Events ({filterRules(rules).length})
              </Typography>
              {filterRules(rules).length > 0 ? (
                filterRules(rules).map(rule => renderRuleCard(rule))
              ) : (
                <Typography variant="body2" color="text.secondary">No rules for this event type</Typography>
              )}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Property Scanner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scan Adobe Launch properties to analyze rule execution order and data element usage
              </Typography>
            </Box>
            {hasMultipleKeys && activeKeySet && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="key-select-label">
                  <KeyIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  API Key
                </InputLabel>
                <Select
                  labelId="key-select-label"
                  value={activeKeySet.id}
                  onChange={handleKeyChange}
                  label="API Key"
                >
                  {keySets.map((keySet) => (
                    <MenuItem key={keySet.id} value={keySet.id}>
                      {keySet.label}
                      {keySet.isDefault && (
                        <Chip size="small" label="Default" sx={{ ml: 1, height: 20 }} />
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          <Stack spacing={3} sx={{ mt: 3 }}>
            <Autocomplete
              value={selectedCompany}
              onChange={(_, value) => handleCompanyChange(value)}
              options={companies}
              getOptionLabel={(option) => option.attributes.name}
              renderInput={(params) => (
                <TextField {...params} label="Select Company" variant="outlined" />
              )}
              disabled={loading}
            />

            <Autocomplete
              value={selectedProperty}
              onChange={(_, value) => setSelectedProperty(value)}
              options={properties}
              getOptionLabel={(option) => option.attributes.name}
              renderInput={(params) => (
                <TextField {...params} label="Select Property" variant="outlined" />
              )}
              disabled={!selectedCompany || loading}
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleScan}
              disabled={!selectedProperty || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading ? 'Scanning...' : 'Scan Property'}
            </Button>
          </Stack>

          {loading && <LinearProgress sx={{ mt: 2 }} />}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {scanResult && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Scan Results: {scanResult.property.name}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip 
                  icon={<InfoIcon />}
                  label={`${scanResult.rules.total} Rules`}
                  color="primary"
                />
                {scanResult.dataElements && (
                  <Chip 
                    icon={<StorageIcon />}
                    label={`${scanResult.dataElements.total} Data Elements`}
                    color="secondary"
                  />
                )}
                <Tooltip title="Refresh scan">
                  <IconButton onClick={handleScan} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search rules by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2 }}
            />

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Execution Order" />
              <Tab label="All Rules" />
              {scanResult.dataElements && <Tab label="Data Elements" />}
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderExecutionOrderTab()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box>
                {filterRules(scanResult.rules.all).map(rule => renderRuleCard(rule))}
              </Box>
            </TabPanel>

            {scanResult.dataElements && (
              <TabPanel value={tabValue} index={2}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Data Elements ({scanResult.dataElements.items.filter(de => 
                      !searchQuery || 
                      de.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Configure and manage data collection elements for this property
                  </Typography>
                  {scanResult.dataElements.items
                    .filter(de => 
                      !searchQuery || 
                      de.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(de => renderDataElementCard(de))}
                </Box>
              </TabPanel>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}