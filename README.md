# The Perpetua Digital Launch Assistant

This interactive tool helps you work with [Adobe's Reactor API](https://developer.adobe.com/experience-platform-apis/references/reactor/). It's built with [Next.js](https://nextjs.org) and hosted via Vercel. It provides a user-friendly interface for making API calls using your Adobe Launch API credentials. No user data or Launch Property data is stored in a database or on the server.

## Architecture
![Architecture Diagram](/public/images/architecture.png)
[Draw.io Diagram Link](https://drive.google.com/file/d/16ZAGvFH4pYcptr5295Mp9KG376mWRabb/view?usp=sharing)

### Front end
The front end is built with Next.js and React. The styles are a mixture of [Tailwind CSS](https://tailwindcss.com/) and [Adobe React Spectrum](https://react-spectrum.adobe.com/react-spectrum/getting-started.html).

### Back end
The back end is built with [Vercel](https://vercel.com) and [Next.js](https://nextjs.org).
`Assistant` is a subdomain of `perpetua.digital` which is hosted on Squarespace. 
I would like to transfer this to Vercel at some point. 

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
