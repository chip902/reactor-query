# ReactorQuery Applet Integration Guide

The ReactorQuery Applet is a self-contained Material-UI component that provides Adobe Launch tools functionality. It can be easily integrated into any Next.js application that uses Material-UI.

## Installation & Setup

### 1. Copy Required Files

Copy these files/folders to your target application:

```
src/
├── components/
│   ├── ReactorQueryApplet.tsx           # Main applet component
│   ├── theme/FloatingThemeToggle.tsx    # Floating theme button
│   ├── property-scanner/                # Property scanner functionality
│   ├── search/                          # MUI search components
│   ├── forms/                           # MUI form components
│   └── wrappers/                        # API key wrapper
├── contexts/
│   ├── ThemeContext.tsx                 # Theme management
│   └── MuiThemeProvider.tsx             # Material-UI integration
├── app/
│   ├── theme.ts                         # MUI theme configuration
│   ├── hooks/                           # API hooks
│   └── api/reactor/                     # API routes
├── lib/                                 # Utility functions
└── utils/                               # Storage utilities
```

### 2. Install Dependencies

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @mui/lab @mui/x-data-grid
npm install @adobe/auth-token @adobe/reactor-sdk
```

### 3. Theme Provider Setup

Wrap your app with the theme providers in your layout:

```tsx
// layout.tsx or _app.tsx
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MaterialThemeProvider } from "@/contexts/MuiThemeProvider";

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <MaterialThemeProvider>
        {children}
      </MaterialThemeProvider>
    </ThemeProvider>
  );
}
```

## Usage

### Basic Integration

```tsx
import { ReactorQueryApplet } from "@/components/ReactorQueryApplet";

export default function MyPage() {
  return (
    <div>
      <h1>My Application</h1>
      
      <ReactorQueryApplet 
        title="Adobe Launch Tools"
        maxHeight="80vh"
        initialView="search"
      />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Adobe Launch Tools"` | Applet title shown in navigation |
| `maxHeight` | `string \| number` | `"90vh"` | Maximum height of the applet |
| `initialView` | `'search' \| 'scanner' \| 'bulk-edit' \| 'settings' \| 'support'` | `"search"` | Initial view to display |

### Advanced Integration

```tsx
import { ReactorQueryApplet } from "@/components/ReactorQueryApplet";
import { Card, CardContent } from "@mui/material";

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Your existing content */}
      <div style={{ flex: 1 }}>
        <Card>
          <CardContent>
            <h2>Dashboard Overview</h2>
            {/* Your dashboard content */}
          </CardContent>
        </Card>
      </div>
      
      {/* Adobe Launch Tools Applet */}
      <div style={{ flex: 2 }}>
        <ReactorQueryApplet 
          title="Adobe Launch Management"
          maxHeight="85vh"
          initialView="scanner"
        />
      </div>
    </div>
  );
}
```

## Features

The applet includes all Adobe Launch management functionality:

### 🔍 Search Tools
- **Text Search**: Search across rules, data elements, and extensions
- **Extension Filter**: Filter by specific extensions
- **Rule ID Search**: Direct rule lookup by ID
- **Publish History**: Track property publishing history
- **Export**: CSV export functionality
- **Relationships**: Analyze data element usage
- **Callbacks**: Manage webhook callbacks

### 🔬 Property Scanner
- Complete property analysis
- Rule execution order visualization
- Data element usage mapping
- Advanced rule categorization

### ✏️ Bulk Edit
- Mass rule editing capabilities
- Bulk operations on multiple rules

### ⚙️ Settings
- API key management
- Secure credential storage
- Video tutorials

### 💬 Support
- Built-in support form
- Direct contact functionality

## Styling & Theming

The applet uses Material-UI components and respects your existing MUI theme. It includes:

- **Automatic theme detection** (light/dark mode)
- **Floating theme toggle** in bottom-right corner
- **Responsive design** for mobile and desktop
- **Consistent spacing** with your MUI theme
- **Custom color palette** that adapts to your theme

### Custom Theme Integration

The applet automatically integrates with your existing MUI theme. To customize colors:

```tsx
// In your theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color', // Applet will use this
    },
    // ... other theme options
  },
});
```

## API Requirements

The applet requires Adobe Launch API access. Users need to configure:

1. **Organization ID** (Adobe Org ID)
2. **Client ID** (Adobe I/O Console)
3. **Client Secret** (Adobe I/O Console)

API keys are stored securely in browser storage and are never transmitted to external servers.

## Performance

- **Bundle size**: ~364 KB total (includes all functionality)
- **Code splitting**: Automatic with Next.js
- **Lazy loading**: Components load on demand
- **Optimized**: Material-UI tree-shaking enabled

## Mobile Support

The applet is fully responsive:
- **Mobile navigation**: Collapsible sidebar
- **Touch-friendly**: Optimized for touch interfaces
- **Responsive breakpoints**: Adapts to all screen sizes

## Security

- **API keys**: Stored locally, never transmitted
- **Secure transmission**: All API calls use HTTPS
- **No external dependencies**: Self-contained functionality

## Troubleshooting

### Common Issues

1. **Theme not applied**: Ensure `MaterialThemeProvider` is wrapped around the applet
2. **API errors**: Check API key configuration in Settings
3. **Build errors**: Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting:
```typescript
// In your environment
NEXT_PUBLIC_DEBUG=true
```

## Support

For issues with the applet:
1. Check the built-in Support tab
2. Verify API key configuration
3. Check browser console for errors
4. Ensure all dependencies are installed correctly

## License

This applet integrates with Adobe Launch APIs and requires proper Adobe licensing and permissions.