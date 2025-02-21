# Adobe Reactor API Tool

This interactive tool helps you work with Adobe's Reactor API. It's built with [Next.js](https://nextjs.org) and provides a user-friendly interface for making API calls using your Adobe credentials.

## 🔐 API Key Security

This tool requires your Adobe API credentials to function. Here's how we handle your credentials:

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

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Contributing

Submit a pull request and we'll review it as soon as possible. 

