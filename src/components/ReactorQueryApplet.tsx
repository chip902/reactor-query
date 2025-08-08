'use client';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
	Box,
	Typography,
	Button,
	Tabs,
	Tab,
	Stack,
	Alert,
	Card,
	CardContent,
	CircularProgress,
	Paper,
	AppBar,
	Toolbar,
	IconButton,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	useTheme,
	useMediaQuery,
	Divider,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterAlt as FilterIcon,
	Description as DocumentIcon,
	CalendarMonth as CalendarIcon,
	Download as DownloadIcon,
	Edit as EditIcon,
	AccountTree as DataCorrelatedIcon,
	ArrowBack as BackIcon,
	FileDownload as ExportIcon,
	Menu as MenuIcon,
	Scanner as ScannerIcon,
	Settings as SettingsIcon,
	Support as SupportIcon,
	Close as CloseIcon,
	Send as SendIcon,
} from '@mui/icons-material';
import { useApiCache } from "@/app/hooks/useApiCache";
import { useApiKeys } from "@/app/hooks/useApiKeys";
import { createApiHeaders } from "@/lib/api-utils";
import WithApiKeys from "@/components/wrappers/WithApiKeys";
import type { TruncatedReactorAPIResponseItem } from "@/lib/types";
import {
	DataElementSearchResponseItem,
	ExtensionSearchResponseItem,
	RuleComponentSearchResponseItem,
	RuleSearchResponseItem,
} from "@/lib/types";
import highlightSearchInJson from "@/lib/highlightSearchInJson";

// MUI Components
import MuiCompanyPicker from "@/components/search/MuiCompanyPicker";
import MuiPropertyPicker from "@/components/search/MuiPropertyPicker";
import MuiTextSearch from "@/components/search/MuiTextSearch";
import MuiExtensionFilter from "@/components/search/MuiExtensionFilter";
import MuiRuleIdSearch from "@/components/search/MuiRuleIdSearch";
import MuiSettingsForm from "@/components/forms/MuiSettingsForm";
import MuiYoutubeEmbed from "@/components/MuiYoutubeEmbed";
import PropertyScanner from "@/components/property-scanner/PropertyScanner";
import { FloatingThemeToggle } from "@/components/theme/FloatingThemeToggle";

// Existing components
import Callbacks from "@/components/callbacks/Callbacks";
import LibraryExport from "@/components/export/LibraryExport";
import PublishHistory from "@/components/publishhistory/PublishHistory";
import Relationships from "@/components/relationships/Relationships";
import BulkRuleEditor from "@/components/bulk-edit/BulkRuleEditor";
import DataElementSearchResponseRow from "@/components/search/DataElementSearchResponseRow";
import ExtensionSearchResponseRow from "@/components/search/ExtensionSearchResponseRow";
import RuleSearchResponseRow from "@/components/search/RuleSearchResponseRow";

type SearchApiResponse = DataElementSearchResponseItem[] | RuleComponentSearchResponseItem[] | RuleSearchResponseItem[];

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
			id={`applet-tabpanel-${index}`}
			aria-labelledby={`applet-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

interface NavigationItem {
	id: number;
	icon: React.ReactNode;
	label: string;
	component: string;
}

const navigationItems: NavigationItem[] = [
	{ id: 0, icon: <SearchIcon />, label: 'Search Tools', component: 'search' },
	{ id: 1, icon: <ScannerIcon />, label: 'Property Scanner', component: 'scanner' },
	{ id: 2, icon: <EditIcon />, label: 'Bulk Edit', component: 'bulk-edit' },
	{ id: 3, icon: <SettingsIcon />, label: 'Settings', component: 'settings' },
	{ id: 4, icon: <SupportIcon />, label: 'Support', component: 'support' },
];

interface ReactorQueryAppletProps {
	title?: string;
	maxHeight?: string | number;
	initialView?: 'search' | 'scanner' | 'bulk-edit' | 'settings' | 'support';
}

function BulkEditContent() {
	const searchParams = useSearchParams();
	const companyId = searchParams?.get("companyId");
	const companyName = searchParams?.get("companyName");
	const propertyId = searchParams?.get("propertyId");
	const propertyName = searchParams?.get("propertyName");

	const [selectedCompany] = useState({
		id: companyId || "",
		name: companyName || "",
	});

	const [selectedProperty] = useState({
		id: propertyId || "",
		name: propertyName || "",
	});

	const { apiKeys } = useApiKeys();

	return (
		<>
			{apiKeys ? (
				<BulkRuleEditor selectedCompany={selectedCompany} selectedProperty={selectedProperty} apiKeys={apiKeys} />
			) : (
				<Alert severity="warning">
					Please configure your API keys in Settings to use the Bulk Edit feature.
				</Alert>
			)}
		</>
	);
}

const SearchContent = () => {
	const { apiKeys } = useApiKeys();
	const { fetchCompanies, fetchProperties, fetchExtensions } = useApiCache();

	// Picker states
	const [companies, setCompanies] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string }>({ id: "", name: "" });
	const [properties, setProperties] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [selectedProperty, setSelectedProperty] = useState<{ id: string; name: string }>({ id: "", name: "" });
	const [propertiesLoading, setPropertiesLoading] = useState(false);
	const [companiesLoading, setCompaniesLoading] = useState(true);

	// Search state
	const [searchValue, setSearchValue] = useState("");
	const [lastSearchedValue, setLastSearchedValue] = useState("");
	const [lastSearchedCompany, setLastSearchedCompany] = useState<{ id: string; name: string }>({ id: "", name: "" });
	const [includeRevisionHistory, setIncludeRevisionHistory] = useState(false);
	const [includeDeletedItems, setIncludeDeletedItems] = useState(false);
	const [results, setResults] = useState<{
		data: SearchApiResponse;
		meta: {
			total_hits: number;
		};
	} | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ruleResults, setRuleResults] = useState<RuleSearchResponseItem[]>([]);
	const [dataElementResults, setDataElementResults] = useState<DataElementSearchResponseItem[]>([]);
	const [extensionResults, setExtensionResults] = useState<ExtensionSearchResponseItem[]>([]);

	// Extension Filter
	const [extensions, setExtensions] = useState<TruncatedReactorAPIResponseItem[]>([]);
	const [extensionsLoading, setExtensionsLoading] = useState(false);
	const [selectedExtension, setSelectedExtension] = useState<{ id: string; name: string; display_name: string }>({ id: "", name: "", display_name: "" });
	const [lastSearchType, setLastSearchType] = useState<number>(0);

	// Tab Navigation
	const [tabValue, setTabValue] = useState(0);

	// Loading companies and properties
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
			setError("Failed to fetch companies");
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
			setError("Failed to fetch properties");
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

	const handleSubmit = async (e: React.FormEvent) => {
		if (!apiKeys) return;
		
		e.preventDefault();
		setLoading(true);
		setError(null);
		setLastSearchedValue(searchValue);
		setLastSearchedCompany(selectedCompany);
		setLastSearchType(tabValue);

		try {
			let response;
			const tabId = tabValue === 0 ? 1 : tabValue === 1 ? 2 : 8;

			if (tabValue === 2) {
				response = await fetch("/api/reactor/getrulebyid", {
					method: "POST",
					headers: createApiHeaders(apiKeys),
					body: JSON.stringify({
						ruleId: searchValue.trim(),
						launchPropertyId: selectedProperty.id,
						includeRevisionHistory,
					}),
				});
			} else {
				response = await fetch("/api/reactor/search", {
					method: "POST",
					headers: createApiHeaders(apiKeys),
					body: JSON.stringify({
						launchPropertyId: selectedProperty.id,
						searchValue,
						includeRevisionHistory,
						includeDeletedItems,
						tabId,
					}),
				});
			}

			if (!response.ok) {
				throw new Error("Search failed");
			}

			const data = await response.json();
			setResults(data);
			setRuleResults(data.data.filter((item: RuleSearchResponseItem) => item.type === "rules"));
			setDataElementResults(data.data.filter((item: DataElementSearchResponseItem) => item.type === "data_elements"));
			setExtensionResults(data.data.filter((item: ExtensionSearchResponseItem) => item.type === "extensions"));
		} catch (_error) {
			setError("An error occurred during search");
		} finally {
			setLoading(false);
		}
	};

	const handleExport = async () => {
		if (!results?.data) return;

		try {
			const response = await fetch("/api/export-csv", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					data: results.data,
					resourceType: searchValue,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate CSV");
			}

			const contentDisposition = response.headers.get("Content-Disposition");
			const filename = contentDisposition
				? contentDisposition.split("filename=")[1].replace(/"/g, "")
				: `search-results-${searchValue}-${new Date().toISOString()}.csv`;

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (_error) {
			console.error("Error exporting CSV:", _error);
		}
	};

	const loadExtensions = useCallback(async () => {
		if (!selectedProperty.id || !apiKeys) return;

		setExtensionsLoading(true);
		try {
			const { data } = await fetchExtensions(selectedProperty.id);
			setExtensions(
				data.sort((a, b) =>
					(a.attributes.display_name || a.attributes.name).localeCompare(
						b.attributes.display_name || b.attributes.name
					)
				)
			);
		} catch (_error) {
			setError("Failed to fetch extensions");
		} finally {
			setExtensionsLoading(false);
		}
	}, [selectedProperty.id, fetchExtensions, apiKeys]);

	useEffect(() => {
		if (selectedProperty.id && apiKeys) {
			loadExtensions();
		} else {
			setExtensions([]);
			setSelectedExtension({ id: "", name: "", display_name: "" });
		}
	}, [selectedProperty, loadExtensions, apiKeys]);

	useEffect(() => {
		if (selectedExtension.name) {
			setSearchValue(selectedExtension.name);
		}
	}, [selectedExtension]);

	useEffect(() => {
		setSearchValue("");
		setResults(null);
		setSelectedExtension({ id: "", name: "", display_name: "" });
	}, [tabValue]);

	if (!apiKeys) {
		return (
			<Alert severity="info">
				Please configure your API keys in Settings to use the search tools.
			</Alert>
		);
	}

	return (
		<Stack spacing={3}>
			<Card>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<Stack spacing={3}>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<MuiCompanyPicker
									companies={companies}
									companiesLoading={companiesLoading}
									selectedCompany={selectedCompany}
									setSelectedCompany={setSelectedCompany}
								/>
								<MuiPropertyPicker
									selectedCompany={selectedCompany}
									selectedProperty={selectedProperty}
									properties={properties}
									propertiesLoading={propertiesLoading}
									setSelectedProperty={setSelectedProperty}
								/>
							</Stack>

							<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
								<Tabs 
									value={tabValue} 
									onChange={(_, newValue) => setTabValue(newValue)}
									variant="scrollable"
									scrollButtons="auto"
								>
									<Tab icon={<SearchIcon />} label="Text Search" />
									<Tab icon={<FilterIcon />} label="Extension Filter" />
									<Tab icon={<DocumentIcon />} label="Rule ID Search" />
									<Tab icon={<CalendarIcon />} label="Publish History" />
									<Tab icon={<ExportIcon />} label="Export" />
									<Tab icon={<DataCorrelatedIcon />} label="Relationships" />
									<Tab icon={<BackIcon />} label="Callbacks" />
								</Tabs>
							</Box>

							<TabPanel value={tabValue} index={0}>
								<MuiTextSearch
									searchValue={searchValue}
									setSearchValue={setSearchValue}
									includeRevisionHistory={includeRevisionHistory}
									setIncludeRevisionHistory={setIncludeRevisionHistory}
									includeDeletedItems={includeDeletedItems}
									setIncludeDeletedItems={setIncludeDeletedItems}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={1}>
								<MuiExtensionFilter
									extensions={extensions}
									extensionsLoading={extensionsLoading}
									selectedExtension={selectedExtension}
									setSelectedExtension={setSelectedExtension}
									selectedProperty={selectedProperty}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={2}>
								<MuiRuleIdSearch
									searchValue={searchValue}
									setSearchValue={setSearchValue}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={3}>
								<PublishHistory 
									selectedCompany={selectedCompany} 
									selectedProperty={selectedProperty} 
									apiKeys={apiKeys} 
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={4}>
								<LibraryExport 
									selectedCompany={selectedCompany} 
									selectedProperty={selectedProperty} 
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={5}>
								<Relationships 
									selectedCompany={selectedCompany} 
									selectedProperty={selectedProperty} 
									apiKeys={apiKeys} 
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={6}>
								<Callbacks 
									selectedProperty={selectedProperty} 
									apiKeys={apiKeys} 
								/>
							</TabPanel>

							{(tabValue === 0 || tabValue === 1 || tabValue === 2) && (
								<Button
									type="submit"
									variant="contained"
									size="large"
									disabled={
										loading || 
										!selectedProperty.id || 
										(!searchValue && tabValue === 0) || 
										(!selectedExtension.name && tabValue === 1)
									}
									startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
									sx={{ alignSelf: 'flex-start', minWidth: 200, py: 1.5 }}
								>
									{loading ? "Searching..." : "Search"}
								</Button>
							)}
						</Stack>
					</form>
				</CardContent>
			</Card>

			{error && (
				<Alert severity="error">
					{error}
				</Alert>
			)}

			{results && (
				<Card>
					<CardContent>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
							<Typography variant="h6" component="h2">
								{lastSearchType === 0
									? `${results.meta.total_hits} results found for "${lastSearchedValue}"`
									: `${results.meta.total_hits} usages found of the ${selectedExtension.display_name} extension`}
							</Typography>
							{results.data.length > 0 && (
								<Button
									variant="outlined"
									startIcon={<DownloadIcon />}
									onClick={handleExport}
								>
									Export to CSV
								</Button>
							)}
						</Box>

						{ruleResults.length > 0 && (
							<Box sx={{ mb: 4 }}>
								<Typography variant="h6" gutterBottom>
									Rules ({ruleResults.length})
								</Typography>
								<Stack spacing={2}>
									{ruleResults.map((item, index) => (
										<RuleSearchResponseRow
											key={item.id}
											item={item}
											searchValue={lastSearchedValue}
											index={index}
											highlightSearchInJson={highlightSearchInJson}
											lastSearchedCompany={lastSearchedCompany}
										/>
									))}
								</Stack>
							</Box>
						)}

						{dataElementResults.length > 0 && (
							<Box sx={{ mb: 4 }}>
								<Typography variant="h6" gutterBottom>
									Data Elements ({dataElementResults.length})
								</Typography>
								<Stack spacing={2}>
									{dataElementResults.map((item, index) => (
										<DataElementSearchResponseRow
											key={item.id}
											item={item}
											searchValue={lastSearchedValue}
											index={index}
											highlightSearchInJson={highlightSearchInJson}
											lastSearchedCompany={lastSearchedCompany}
										/>
									))}
								</Stack>
							</Box>
						)}

						{extensionResults.length > 0 && (
							<Box sx={{ mb: 4 }}>
								<Typography variant="h6" gutterBottom>
									Extensions ({extensionResults.length})
								</Typography>
								<Stack spacing={2}>
									{extensionResults.map((item, index) => (
										<ExtensionSearchResponseRow
											key={item.id}
											item={item}
											searchValue={lastSearchedValue}
											index={index}
											highlightSearchInJson={highlightSearchInJson}
											lastSearchedCompany={lastSearchedCompany}
										/>
									))}
								</Stack>
							</Box>
						)}
					</CardContent>
				</Card>
			)}
		</Stack>
	);
};

const SupportContent = () => {
	const [subject, setSubject] = useState("API Key Settings");
	const [message, setMessage] = useState("");
	const [email, setEmail] = useState("");
	const [isEmailValid, setIsEmailValid] = useState(false);
	const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const supportSubjects = ["API Key Settings", "Search", "Relationships", "Exporting", "Extension Filter", "Publish History", "Feature Request", "Other"];

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		setIsEmailValid(validateEmail(value));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !message) {
			setStatus("error");
			setErrorMessage("Please fill in all required fields.");
			return;
		}

		setStatus("sending");

		try {
			const response = await fetch("/api/admin/sendsupportemail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subject,
					message,
					userEmail: email,
					userId: "anonymous",
				}),
			});

			if (!response.ok) throw new Error("Failed to send message");

			setStatus("success");
			setMessage("");
			setEmail("");
		} catch (_error) {
			setStatus("error");
			setErrorMessage("There was an error sending your message. Please try again.");
		}
	};

	return (
		<Card>
			<CardContent>
				<Typography variant="h5" component="h2" gutterBottom>
					Contact Support
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Need help? We&apos;re here to assist you with any questions or issues you may have.
				</Typography>

				{status === "success" && (
					<Alert severity="success" sx={{ mb: 3 }}>
						Your support email has been sent successfully. We will respond to your inquiry as soon as possible.
					</Alert>
				)}

				{status === "error" && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{errorMessage}
					</Alert>
				)}

				<Box component="form" onSubmit={handleSubmit}>
					<Stack spacing={3}>
						<FormControl fullWidth required>
							<InputLabel>Subject</InputLabel>
							<Select
								value={subject}
								label="Subject"
								onChange={(e) => setSubject(e.target.value)}
							>
								{supportSubjects.map((s) => (
									<MenuItem key={s} value={s}>{s}</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							fullWidth
							required
							type="email"
							label="Email"
							value={email}
							onChange={handleEmailChange}
							error={email.length > 0 && !isEmailValid}
							helperText={
								email.length > 0 && !isEmailValid 
									? "Please enter a valid email address"
									: "We'll use this to get back to you"
							}
						/>

						<TextField
							fullWidth
							required
							multiline
							rows={6}
							label="Message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Please describe your issue in detail..."
							helperText={`${message.length} characters`}
						/>

						<Button
							type="submit"
							variant="contained"
							size="large"
							disabled={status === "sending" || !isEmailValid || !message.trim()}
							startIcon={status === "sending" ? <CircularProgress size={20} /> : <SendIcon />}
							sx={{ py: 1.5 }}
						>
							{status === "sending" ? "Sending..." : "Send Message"}
						</Button>
					</Stack>
				</Box>
			</CardContent>
		</Card>
	);
};

export function ReactorQueryApplet({ 
	title = "Adobe Launch Tools", 
	maxHeight = "90vh",
	initialView = "search" 
}: ReactorQueryAppletProps) {
	const [currentView, setCurrentView] = useState(initialView);
	const [mobileOpen, setMobileOpen] = useState(false);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const { apiKeys, isLoading } = useApiKeys();

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleNavigation = (view: string) => {
		setCurrentView(view as typeof initialView);
		if (isMobile) {
			setMobileOpen(false);
		}
	};

	const renderContent = () => {
		if (isLoading) {
			return (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress />
				</Box>
			);
		}

		switch (currentView) {
			case 'search':
				return <SearchContent />;
			case 'scanner':
				return apiKeys ? <PropertyScanner apiKeys={apiKeys} /> : (
					<Alert severity="info">Please configure your API keys in Settings to use the Property Scanner.</Alert>
				);
			case 'bulk-edit':
				return (
					<Suspense fallback={<CircularProgress />}>
						<BulkEditContent />
					</Suspense>
				);
			case 'settings':
				return (
					<Stack spacing={6}>
						<MuiSettingsForm />
						<Box>
							<Typography variant="h5" component="h2" gutterBottom>
								How to create your API keys
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
								Follow this video guide to set up your Adobe I/O Console project and obtain the required API credentials.
							</Typography>
							<MuiYoutubeEmbed videoId="5s65A_JFld8" title="How to create Adobe Launch API keys" />
						</Box>
					</Stack>
				);
			case 'support':
				return <SupportContent />;
			default:
				return <SearchContent />;
		}
	};

	const drawer = (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="h6" component="div">
					{title}
				</Typography>
				{isMobile && (
					<IconButton onClick={handleDrawerToggle}>
						<CloseIcon />
					</IconButton>
				)}
			</Box>
			<Divider />
			<List sx={{ flex: 1 }}>
				{navigationItems.map((item) => (
					<ListItem key={item.id} disablePadding>
						<ListItemButton
							selected={currentView === item.component}
							onClick={() => handleNavigation(item.component)}
						>
							<ListItemIcon>{item.icon}</ListItemIcon>
							<ListItemText primary={item.label} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Box>
	);

	return (
		<WithApiKeys>
			<Paper 
				elevation={3} 
				sx={{ 
					height: maxHeight, 
					display: 'flex', 
					overflow: 'hidden',
					borderRadius: 2,
				}}
			>
				{/* Navigation Sidebar */}
				<Box
					component="nav"
					sx={{
						width: { md: 280 },
						flexShrink: { md: 0 },
					}}
				>
					{isMobile ? (
						<Drawer
							variant="temporary"
							anchor="left"
							open={mobileOpen}
							onClose={handleDrawerToggle}
							ModalProps={{ keepMounted: true }}
							sx={{
								'& .MuiDrawer-paper': {
									boxSizing: 'border-box',
									width: 280,
									backgroundColor: theme.palette.background.paper,
								},
							}}
						>
							{drawer}
						</Drawer>
					) : (
						<Box
							sx={{
								width: 280,
								height: '100%',
								backgroundColor: theme.palette.background.paper,
								borderRight: `1px solid ${theme.palette.divider}`,
							}}
						>
							{drawer}
						</Box>
					)}
				</Box>

				{/* Main Content */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
					{/* Mobile App Bar */}
					{isMobile && (
						<AppBar 
							position="static" 
							elevation={0}
							sx={{
								backgroundColor: theme.palette.background.paper,
								borderBottom: `1px solid ${theme.palette.divider}`,
							}}
						>
							<Toolbar>
								<IconButton
									color="inherit"
									aria-label="open drawer"
									edge="start"
									onClick={handleDrawerToggle}
									sx={{ mr: 2 }}
								>
									<MenuIcon />
								</IconButton>
								<Typography variant="h6" noWrap component="div">
									{title}
								</Typography>
							</Toolbar>
						</AppBar>
					)}

					{/* Content Area */}
					<Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
						{renderContent()}
					</Box>
				</Box>

				{/* Floating Theme Toggle */}
				<FloatingThemeToggle />
			</Paper>
		</WithApiKeys>
	);
}