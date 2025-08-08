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
} from '@mui/icons-material';
import { TruncatedReactorAPIResponseItem } from '@/lib/types';
import { createApiHeaders } from '@/lib/api-utils';

interface PropertyScannerProps {
  apiKeys: {
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

export default function PropertyScanner({ apiKeys }: PropertyScannerProps) {
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

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/reactor/listcompanies', {
        method: 'POST',
        headers: createApiHeaders(apiKeys),
      });
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load companies');
    }
  };

  const loadProperties = async (companyId: string) => {
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

  const handleScan = async () => {
    if (!selectedProperty) return;

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

  const filterRules = (rules: RuleWithComponents[]) => {
    if (!searchQuery) return rules;
    return rules.filter(rule => 
      rule.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase())
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
            
            {eventComponents.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  <ScheduleIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Events ({eventComponents.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {eventComponents.map(comp => (
                    <Chip 
                      key={comp.id}
                      label={comp.attributes.delegate_descriptor_id?.split('::').pop() || 'Unknown'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            
            {conditionComponents.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  <CallSplitIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Conditions ({conditionComponents.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {conditionComponents.map(comp => (
                    <Chip 
                      key={comp.id}
                      label={comp.attributes.delegate_descriptor_id?.split('::').pop() || 'Unknown'}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            
            {actionComponents.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  <PlayArrowIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Actions ({actionComponents.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {actionComponents.map(comp => (
                    <Chip 
                      key={comp.id}
                      label={comp.attributes.delegate_descriptor_id?.split('::').pop() || 'Unknown'}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(rule.attributes.created_at).toLocaleString()}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Updated: {new Date(rule.attributes.updated_at).toLocaleString()}
              </Typography>
            </Box>
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
          <Typography variant="h4" gutterBottom>
            Property Scanner
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Scan Adobe Launch properties to analyze rule execution order and data element usage
          </Typography>

          <Stack spacing={3}>
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
                  {scanResult.dataElements.items
                    .filter(de => 
                      !searchQuery || 
                      de.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(de => (
                      <Card key={de.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6">{de.attributes.name}</Typography>
                          <Chip label={`ID: ${de.id}`} size="small" sx={{ mt: 1 }} />
                          {de.attributes.delegate_descriptor_id && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Type: {de.attributes.delegate_descriptor_id.split('::').pop()}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              </TabPanel>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}