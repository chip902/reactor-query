# Claude Code Project Context

## Project Overview

**Adobe Launch Tools - Reactor Query** is a comprehensive Next.js application that provides a suite of tools for managing Adobe Launch properties via the Reactor API. The application has been architected as an embeddable component using Material-UI design system.

## Key Architecture Decisions

### Embeddable Component Design
- **Main Component**: `ReactorQueryApplet` consolidates the entire application into a single, self-contained component
- **Integration Ready**: Can be embedded in any Next.js frontend that uses Material-UI
- **Configurable**: Supports title, maxHeight, and initialView props for customization

### Technology Stack
- **Frontend**: Next.js 15 with App Router, Material-UI v7, TypeScript, Emotion styling
- **Backend**: Vercel API routes with Adobe Reactor SDK
- **Styling**: Migrated from React Spectrum to Material-UI for consistency and embeddability
- **Theme**: Supports dark/light mode with FloatingThemeToggle component

### Security & Privacy
- **No Data Persistence**: All data is ephemeral, sourced directly from Adobe Launch API
- **Secure Credentials**: API keys are Base64 encoded, transmitted via headers, never stored
- **Privacy-First**: No user data or property data stored in databases

## Core Features Implementation

### 1. Search Tools (`SearchContent` component)
- Text search, extension filtering, and rule ID lookup
- Tabbed interface with search, export, and relationship tools
- Company/Property selection with caching
- CSV export functionality

### 2. Property Scanner (`PropertyScanner` component)
- Rule execution order analysis with visual indicators
- Expandable components showing JSON settings
- Data elements analysis with expandable views
- Dark mode compatible code block rendering

### 3. Bulk Rule Editor (`BulkRuleEditor` component)
- **Find/Replace**: Search patterns across rule components with optional replacement
- **Search Scopes**: Filter by actions, conditions, events, or all components
- **Preview Mode**: View matches without making changes (search-only)
- **Company/Property Selection**: Internal autocomplete components for selection
- **Bidirectional Data Flow**: Safe preview → update workflow

### 4. Additional Tools
- Publish History, Library Export, Relationships, Callbacks
- Settings with API key management and video tutorial
- Support contact form with subject categorization

## Recent Development History

### Material-UI Migration
- Migrated entire application from React Spectrum to Material-UI v7
- Maintained feature parity while improving visual consistency
- Updated all components to use MUI styling patterns

### Applet Consolidation
- Combined multi-page application into single `ReactorQueryApplet` component
- Internal navigation via sidebar with mobile-responsive drawer
- Floating theme toggle for dark/light mode switching

### Bulk Editor Implementation
- Built comprehensive find/replace tool for rule components
- Implemented search-only mode for analysis without changes
- Added company/property selection with proper state management
- Created bidirectional data flow with preview dialogs

## API Endpoints

### Core Reactor API Routes (`/api/reactor/`)
- **Search & Retrieval**: `search`, `getrulebyid`, `listcompanies`, `listproperties`
- **Component Management**: `listcomponentsforrule`, `listdataelements`, `listextensions`
- **Property Analysis**: `scanproperty`, `listrules`
- **Updates**: `updaterule`, `updaterulecomponent` (with revision support)
- **Utilities**: `createcallback`, `deletecallback`, `listcallbacks`

### Utility Routes
- **Export**: `/api/export-csv` for search results
- **Support**: `/api/admin/sendsupportemail` for user assistance

## File Structure

### Components
- **`ReactorQueryApplet.tsx`**: Main embeddable component with navigation
- **`bulk-edit/BulkRuleEditor.tsx`**: Find/replace tool with Material-UI
- **`property-scanner/PropertyScanner.tsx`**: Property analysis with expandable components
- **`search/`**: MUI-based search components (company picker, property picker, etc.)
- **`theme/FloatingThemeToggle.tsx`**: Dark/light mode toggle

### API Integration
- **`lib/reactor-route-utils.ts`**: Common utilities for Reactor API routes
- **`lib/api-utils.ts`**: Client-side API header creation
- **`app/hooks/`**: useApiCache, useApiKeys for state management

### Types
- **`lib/types.ts`**: TypeScript interfaces for Reactor API responses
- Component interfaces for rules, data elements, extensions

## Development Guidelines

### Code Standards
- TypeScript for type safety
- Material-UI components with consistent styling
- Responsive design with mobile-first approach
- Error handling with user-friendly messages

### Security Practices
- Never store API credentials
- Base64 encode credentials during transmission
- Validate all API inputs
- Log API keys are explicitly redacted in middleware

### Testing
- Build verification: `npm run build`
- Type checking integrated in build process
- Component props validation

## Integration Instructions

To embed the ReactorQueryApplet in another Next.js application:

```tsx
import { ReactorQueryApplet } from '@/components/ReactorQueryApplet';

// Basic usage
<ReactorQueryApplet />

// Customized usage
<ReactorQueryApplet 
  title="Custom Adobe Launch Tools"
  maxHeight="80vh"
  initialView="scanner"
/>
```

### Requirements for Host Application
- Next.js 15+ with App Router
- Material-UI v7+ installed
- Theme provider setup for dark/light mode
- API key management (or use built-in settings)

## Future Considerations

- **Performance**: Component lazy loading and code splitting
- **Extensibility**: Plugin architecture for additional tools
- **Analytics**: Usage tracking without compromising privacy
- **Multi-tenant**: Company-specific branding options