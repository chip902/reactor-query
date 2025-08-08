import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Chip,
	Alert,
	LinearProgress,
	Paper,
	Divider,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Collapse,
	IconButton,
	Snackbar,
	Autocomplete,
} from '@mui/material';
import {
	Search as SearchIcon,
	FindReplace as FindReplaceIcon,
	PlayArrow as PlayArrowIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
	CheckCircle as SuccessIcon,
	Error as ErrorIcon,
	Preview as PreviewIcon,
} from '@mui/icons-material';
import { createApiHeaders } from "@/lib/api-utils";
import { useApiCache } from "@/app/hooks/useApiCache";
import type { TruncatedReactorAPIResponseItem } from "@/lib/types";

interface BulkRuleEditorProps {
	apiKeys: { clientId: string; clientSecret: string; orgId: string } | null;
}


interface MatchedRule {
	id: string;
	name: string;
	matchedComponents: {
		componentId: string;
		componentName: string;
		componentType: string;
		originalSettings: string;
		newSettings: string;
		matches: string[];
	}[];
}

interface UpdateResult {
	ruleId: string;
	ruleName: string;
	success: boolean;
	error?: string;
	updatedComponents: number;
}

const BulkRuleEditor = ({ apiKeys }: BulkRuleEditorProps) => {
	const { fetchCompanies, fetchProperties } = useApiCache();

	// Company and Property Selection
	const [companies, setCompanies] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string }>({ id: "", name: "" });
	const [properties, setProperties] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [selectedProperty, setSelectedProperty] = useState<{ id: string; name: string }>({ id: "", name: "" });
	const [propertiesLoading, setPropertiesLoading] = useState(false);
	const [companiesLoading, setCompaniesLoading] = useState(true);

	// Core state
	const [searchQuery, setSearchQuery] = useState("");
	const [replaceQuery, setReplaceQuery] = useState("");
	const [searchScope, setSearchScope] = useState<'all' | 'actions' | 'conditions' | 'events'>('actions');
	const [isLoading, setIsLoading] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	
	// Results and UI state
	const [matchedRules, setMatchedRules] = useState<MatchedRule[]>([]);
	const [updateResults, setUpdateResults] = useState<UpdateResult[]>([]);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
	const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

	// Helper functions
	const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setSnackbarOpen(true);
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

	// Load companies and properties
	const loadCompanies = useCallback(async () => {
		if (!apiKeys) return;
		setCompaniesLoading(true);
		try {
			const { data } = await fetchCompanies();
			setCompanies(data);
			if (data.length === 1) {
				const company = data[0];
				setSelectedCompany({ id: company.id, name: company.attributes.name });
			}
		} catch (_error) {
			showSnackbar("Failed to fetch companies", 'error');
		} finally {
			setCompaniesLoading(false);
		}
	}, [fetchCompanies, apiKeys]);

	const loadProperties = useCallback(async () => {
		if (!selectedCompany.id || !apiKeys) return;

		setPropertiesLoading(true);
		try {
			const { data } = await fetchProperties(selectedCompany.id);
			setProperties(data);
		} catch (_error) {
			showSnackbar("Failed to fetch properties", 'error');
		} finally {
			setPropertiesLoading(false);
		}
	}, [selectedCompany.id, fetchProperties, apiKeys]);

	useEffect(() => {
		if (apiKeys) {
			loadCompanies();
		}
	}, [loadCompanies, apiKeys]);

	useEffect(() => {
		if (selectedCompany.id && apiKeys) {
			loadProperties();
		} else {
			setProperties([]);
			setSelectedProperty({ id: "", name: "" });
		}
	}, [selectedCompany, loadProperties, apiKeys]);

	// Find rules that match the search query by analyzing their components
	const findMatchingRules = async () => {
		if (!searchQuery.trim()) {
			showSnackbar("Please enter a search term", 'warning');
			return;
		}

		if (!selectedProperty?.id) {
			showSnackbar("Please select a property first", 'warning');
			return;
		}

		if (!apiKeys) {
			showSnackbar("API keys are required", 'error');
			return;
		}

		setIsLoading(true);
		setMatchedRules([]);

		try {
			console.log("Searching for rules with pattern:", searchQuery);

			// Get all rules for the property
			const rulesResponse = await fetch("/api/reactor/listrules", {
				method: "POST",
				headers: createApiHeaders(apiKeys),
				body: JSON.stringify({ propertyId: selectedProperty.id }),
			});

			if (!rulesResponse.ok) {
				throw new Error("Failed to fetch rules");
			}

			const rulesData = await rulesResponse.json();
			console.log(`Found ${rulesData.length} rules to analyze`);

			const matchedRulesArray: MatchedRule[] = [];

			// Analyze each rule for matches
			for (const rule of rulesData) {
				try {
					// Get components for this rule
					const componentsResponse = await fetch("/api/reactor/listcomponentsforrule", {
						method: "POST",
						headers: createApiHeaders(apiKeys),
						body: JSON.stringify({ ruleId: rule.id }),
					});

					if (!componentsResponse.ok) {
						console.warn(`Failed to fetch components for rule ${rule.id}`);
						continue;
					}

					const components = await componentsResponse.json();
					const matchedComponents: MatchedRule['matchedComponents'] = [];

					// Check each component for matches
					for (const component of components) {
						// Filter by search scope
						const componentType = component.attributes.delegate_descriptor_id?.includes('::actions::') ? 'actions' :
							component.attributes.delegate_descriptor_id?.includes('::conditions::') ? 'conditions' :
							component.attributes.delegate_descriptor_id?.includes('::events::') ? 'events' : 'unknown';

						if (searchScope !== 'all' && componentType !== searchScope) {
							continue;
						}

						// Check if the component settings contain our search query
						const settings = component.attributes.settings;
						if (settings && typeof settings === 'string') {
							try {
								const settingsObj = JSON.parse(settings);
								const settingsStr = JSON.stringify(settingsObj).toLowerCase();
								
								if (settingsStr.includes(searchQuery.toLowerCase())) {
									// Find all matches for preview
									const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
									const matches = settingsStr.match(regex) || [];
									
									// Create the new settings with replacements (only if replacement text provided)
									let newSettings = settings;
									if (replaceQuery.trim()) {
										newSettings = settings.replace(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceQuery);
									}

									matchedComponents.push({
										componentId: component.id,
										componentName: component.attributes.name,
										componentType: componentType,
										originalSettings: settings,
										newSettings: newSettings,
										matches: matches
									});
								}
							} catch (_parseError) {
								console.warn(`Failed to parse settings for component ${component.id}`);
							}
						}
					}

					// If any components matched, add the rule
					if (matchedComponents.length > 0) {
						matchedRulesArray.push({
							id: rule.id,
							name: rule.attributes.name,
							matchedComponents
						});
					}
				} catch (error) {
					console.warn(`Error analyzing rule ${rule.id}:`, error);
				}
			}

			setMatchedRules(matchedRulesArray);
			setIsPreviewOpen(true);
			
			showSnackbar(
				`Found ${matchedRulesArray.length} rules with ${matchedRulesArray.reduce((sum, rule) => sum + rule.matchedComponents.length, 0)} matching components`,
				'success'
			);

		} catch (error) {
			console.error("Error finding matching rules:", error);
			showSnackbar("Error searching rules. Please try again.", 'error');
		} finally {
			setIsLoading(false);
		}
	};

	// Execute the bulk updates
	const executeUpdates = async () => {
		if (!replaceQuery.trim()) {
			showSnackbar("Please enter replacement text to proceed with updates", 'warning');
			return;
		}

		if (matchedRules.length === 0) {
			showSnackbar("No matching rules found. Please search first.", 'warning');
			return;
		}

		if (!apiKeys) {
			showSnackbar("API keys are required", 'error');
			return;
		}

		setIsUpdating(true);
		setUpdateResults([]);

		try {
			const results: UpdateResult[] = [];

			for (const rule of matchedRules) {
				let updatedComponents = 0;
				let ruleUpdateSuccess = true;
				let ruleError = '';

				try {
					// Update each matched component in this rule
					for (const matchedComponent of rule.matchedComponents) {
						try {
							const updateResponse = await fetch("/api/reactor/updaterulecomponent", {
								method: "POST",
								headers: createApiHeaders(apiKeys),
								body: JSON.stringify({
									componentId: matchedComponent.componentId,
									updates: {
										settings: matchedComponent.newSettings
									},
									revise: true
								}),
							});

							if (!updateResponse.ok) {
								const errorData = await updateResponse.json();
								throw new Error(errorData.error || "Failed to update component");
							}

							const result = await updateResponse.json();
							if (result.success) {
								updatedComponents++;
								console.log(`Updated component ${matchedComponent.componentId} in rule ${rule.name}`);
							} else {
								throw new Error(result.error || "Update failed");
							}
						} catch (componentError) {
							console.error(`Error updating component ${matchedComponent.componentId}:`, componentError);
							ruleUpdateSuccess = false;
							ruleError = componentError instanceof Error ? componentError.message : "Component update failed";
						}
					}

					results.push({
						ruleId: rule.id,
						ruleName: rule.name,
						success: ruleUpdateSuccess,
						error: ruleUpdateSuccess ? undefined : ruleError,
						updatedComponents
					});

				} catch (error) {
					console.error(`Error updating rule ${rule.name}:`, error);
					results.push({
						ruleId: rule.id,
						ruleName: rule.name,
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
						updatedComponents: 0
					});
				}
			}

			setUpdateResults(results);
			setIsResultsDialogOpen(true);
			setIsPreviewOpen(false);

			// Show summary
			const successful = results.filter(r => r.success).length;
			const failed = results.length - successful;
			const totalComponents = results.reduce((sum, r) => sum + r.updatedComponents, 0);

			if (failed === 0) {
				showSnackbar(`Successfully updated ${successful} rules (${totalComponents} components)`, 'success');
			} else if (successful === 0) {
				showSnackbar(`Failed to update all ${failed} rules`, 'error');
			} else {
				showSnackbar(`Updated ${successful} rules, ${failed} failed (${totalComponents} total components)`, 'warning');
			}

		} catch (error) {
			console.error("Error executing updates:", error);
			showSnackbar("Error executing updates. Please try again.", 'error');
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h4" gutterBottom>
						<FindReplaceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
						Bulk Rule Editor
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Find and replace text across multiple rule components. Perfect for updating Pixel IDs, tracking codes, and other configuration values.
					</Typography>

					<Stack spacing={3}>
						{/* Company and Property Selection */}
						{!apiKeys ? (
							<Alert severity="info">
								Please configure your API keys in Settings to use the Bulk Edit feature.
							</Alert>
						) : (
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<Autocomplete
									fullWidth
									loading={companiesLoading}
									options={companies}
									value={selectedCompany.id ? companies.find(c => c.id === selectedCompany.id) || null : null}
									onChange={(_, value) => {
										setSelectedCompany(value ? { id: value.id, name: value.attributes.name } : { id: "", name: "" });
									}}
									getOptionLabel={(option) => option.attributes.name}
									renderInput={(params) => (
										<TextField {...params} label="Select Company" variant="outlined" />
									)}
									disabled={companiesLoading || !apiKeys}
								/>

								<Autocomplete
									fullWidth
									loading={propertiesLoading}
									options={properties}
									value={selectedProperty.id ? properties.find(p => p.id === selectedProperty.id) || null : null}
									onChange={(_, value) => {
										setSelectedProperty(value ? { id: value.id, name: value.attributes.name } : { id: "", name: "" });
									}}
									getOptionLabel={(option) => option.attributes.name}
									renderInput={(params) => (
										<TextField {...params} label="Select Property" variant="outlined" />
									)}
									disabled={!selectedCompany.id || propertiesLoading || !apiKeys}
								/>
							</Stack>
						)}

						{/* Search Configuration */}
						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
							<TextField
								fullWidth
								label="Find"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Text to find (e.g., old-pixel-id)"
								required
								InputProps={{
									startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
								}}
							/>
							
							<TextField
								fullWidth
								label="Replace With (Optional)"
								value={replaceQuery}
								onChange={(e) => setReplaceQuery(e.target.value)}
								placeholder="Replacement text (leave empty to just search)"
								helperText="Leave empty to preview matches without making changes"
								InputProps={{
									startAdornment: <FindReplaceIcon sx={{ mr: 1, color: 'text.secondary' }} />,
								}}
							/>
						</Stack>

						{/* Search Scope */}
						<FormControl sx={{ minWidth: 200 }}>
							<InputLabel>Search Scope</InputLabel>
							<Select
								value={searchScope}
								onChange={(e) => setSearchScope(e.target.value as typeof searchScope)}
								label="Search Scope"
							>
								<MenuItem value="all">All Components</MenuItem>
								<MenuItem value="actions">Actions Only</MenuItem>
								<MenuItem value="conditions">Conditions Only</MenuItem>
								<MenuItem value="events">Events Only</MenuItem>
							</Select>
						</FormControl>

						{/* Action Buttons */}
						<Stack direction="row" spacing={2}>
							<Button
								variant="outlined"
								size="large"
								startIcon={isLoading ? <LinearProgress sx={{ width: 20 }} /> : <PreviewIcon />}
								onClick={findMatchingRules}
								disabled={!searchQuery.trim() || isLoading}
								sx={{ minWidth: 200 }}
							>
								{isLoading ? "Searching..." : "Find & Preview"}
							</Button>

							<Button
								variant="contained"
								size="large"
								startIcon={<PlayArrowIcon />}
								onClick={executeUpdates}
								disabled={!replaceQuery.trim() || matchedRules.length === 0 || isUpdating}
								sx={{ minWidth: 200 }}
							>
								{isUpdating ? "Updating..." : `Update ${matchedRules.length} Rules`}
							</Button>
						</Stack>

						{/* Progress Indicator */}
						{isLoading && <LinearProgress />}
					</Stack>
				</CardContent>
			</Card>

			{/* Preview Dialog */}
			<Dialog open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>
					Preview Changes
					<Typography variant="body2" color="text.secondary">
						Found {matchedRules.length} rules with {matchedRules.reduce((sum, rule) => sum + rule.matchedComponents.length, 0)} matching components
					</Typography>
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
							<Typography variant="subtitle2" gutterBottom>Changes to be made:</Typography>
							<Stack direction="row" spacing={2} alignItems="center">
								<Chip label={`Find: "${searchQuery}"`} variant="outlined" />
								<Typography variant="body2">→</Typography>
								<Chip label={`Replace: "${replaceQuery}"`} color="primary" />
							</Stack>
						</Paper>

						{matchedRules.map((rule) => (
							<Card key={rule.id} variant="outlined">
								<CardContent>
									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Box>
											<Typography variant="h6">{rule.name}</Typography>
											<Typography variant="body2" color="text.secondary">
												{rule.matchedComponents.length} component{rule.matchedComponents.length !== 1 ? 's' : ''} will be updated
											</Typography>
										</Box>
										<IconButton onClick={() => toggleRuleExpansion(rule.id)}>
											{expandedRules.has(rule.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
										</IconButton>
									</Stack>

									<Collapse in={expandedRules.has(rule.id)}>
										<Divider sx={{ my: 2 }} />
										<Stack spacing={2}>
											{rule.matchedComponents.map((component) => (
												<Paper key={component.componentId} sx={{ p: 2, backgroundColor: 'background.default' }}>
													<Typography variant="subtitle2" gutterBottom>
														{component.componentName} ({component.componentType})
													</Typography>
													<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
														{component.matches.length} match{component.matches.length !== 1 ? 'es' : ''} found
													</Typography>
													<Stack spacing={1}>
														<Typography variant="caption">Original:</Typography>
														<Paper sx={{ p: 1, backgroundColor: 'error.50', maxHeight: 100, overflow: 'auto' }}>
															<pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
																{component.originalSettings}
															</pre>
														</Paper>
														<Typography variant="caption">After changes:</Typography>
														<Paper sx={{ p: 1, backgroundColor: 'success.50', maxHeight: 100, overflow: 'auto' }}>
															<pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
																{component.newSettings}
															</pre>
														</Paper>
													</Stack>
												</Paper>
											))}
										</Stack>
									</Collapse>
								</CardContent>
							</Card>
						))}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsPreviewOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={executeUpdates} disabled={isUpdating || !replaceQuery.trim()}>
						Apply Changes
					</Button>
				</DialogActions>
			</Dialog>

			{/* Results Dialog */}
			<Dialog open={isResultsDialogOpen} onClose={() => setIsResultsDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Update Results</DialogTitle>
				<DialogContent>
					<Stack spacing={2}>
						{updateResults.map((result) => (
							<Stack key={result.ruleId} direction="row" spacing={2} alignItems="center">
								{result.success ? <SuccessIcon color="success" /> : <ErrorIcon color="error" />}
								<Box sx={{ flex: 1 }}>
									<Typography variant="body1">{result.ruleName}</Typography>
									<Typography variant="caption" color="text.secondary">
										{result.success 
											? `${result.updatedComponents} component${result.updatedComponents !== 1 ? 's' : ''} updated`
											: result.error
										}
									</Typography>
								</Box>
							</Stack>
						))}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsResultsDialogOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={() => setSnackbarOpen(false)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default BulkRuleEditor;