# Adobe Launch Tools - Reactor Query

This interactive tool helps you work with [Adobe's Reactor API](https://developer.adobe.com/experience-platform-apis/references/reactor/). It's built with [Next.js](https://nextjs.org) and provides a comprehensive suite of tools for managing Adobe Launch properties. The application is designed as an embeddable component using Material-UI design system and can be integrated into other Next.js frontends.

## Key Features

### 🔍 **Search Tools**
- **Text Search**: Full-text search across rules, data elements, and extensions
- **Extension Filter**: Search by specific extension usage across properties
- **Rule ID Search**: Direct rule lookup by ID with revision history
- **Export to CSV**: Download search results for analysis

### 📊 **Property Scanner**
- Comprehensive property analysis with rule execution order visualization
- Expandable rule components and data elements with JSON views
- Rule execution flow analysis (Library Loaded → Page Bottom → Window Loaded → DOM Ready)
- Dark mode compatible code block display

### ✏️ **Bulk Rule Editor**
- Find and replace functionality across multiple rule components
- Search-only mode for pattern analysis without making changes
- Component-level filtering (actions, conditions, events, or all)
- Real-time preview of changes before applying updates
- Bidirectional data flow for safe bulk operations

### ⚙️ **Additional Tools**
- Publish History tracking
- Library Export functionality
- Relationship analysis between rules and components
- Callback management
- API key management with secure credential handling

## Architecture

The application is built as a self-contained embeddable component (`ReactorQueryApplet`) that consolidates all functionality into a single component for easy integration into other Next.js applications.

### Front end
- **Next.js 15** with App Router
- **Material-UI v7** design system with Emotion styling
- **React** with TypeScript for type safety
- **Theme Provider** for dark/light mode support

### Back end
- **Vercel** hosting with Next.js API routes
- **Adobe Reactor SDK** for Launch API integration
- **No database storage** - all data is ephemeral and sourced directly from Adobe Launch API

**Privacy-First Design**: No user data or Launch Property data is stored in a database or on the server. All credentials are handled securely and never persisted.

### Building & Deployment
The project will build and deploy immediately on Vercel whenever the `main` branch is updated.

## 🔐 API Keys

Using this app in development or in production requires Adobe Launch API credentials to function. 
To setup a developer project in Adobe Developer Console, [see the video here](https://www.youtube.com/watch?v=5s65A_JFld8).
Here's how we handle your credentials:

1. **Credential Input**: You'll need to provide:
   - Client ID
   - Client Secret
   - Organization ID

2. **Security Measures**:
   - Credentials are only used for immediate API calls and are never stored outside of your browser
   - Credentials are only used for the duration of the API call
   - All data is transmitted securely over HTTPS
   - Credentials are sent via the `x-api-keys` header and are Base64 encoded during transmission
   - The `x-api-keys` header is explicitly redacted in API logging. See `middleware.ts` for details.
   - No data persists between sessions

3. **Best Practices**:
   - Prepare your API credentials with a special read-only product profile. See the video on the [Settings](https://assistant.perpetua.digital/settings) page for more information.
   - Rotate your API keys regularly
   - Never share your API keys

---

## Getting Started

1. Fork this repository and clone it to your local machine
2. Make an `.env.local` file using the `NEXT_PUBLIC_` values from `.env.sample`. Message me if you need other keys.
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server
5. `next dev --experimental-https` should make you an SSL certificate and run the dev server over HTTPS
6. Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.
7. Have at it!

## API Routes
The API routes that interact with Launch are under `/api/reactor/`. I have attempted to match the names of the routes to the same as they as named in the [Reactor Node SDK](https://github.com/adobe/reactor-sdk-javascript/tree/master) without being too verbose. 

For example:
`/api/reactor/listdataelements` - Lists the data elements for a property and uses the `reactor.listDataElementsForProperty(propertyId)`. There are some unused routes in the `api/reactor` folder that are leftover from the previous version of this app that may be useful in the future.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
