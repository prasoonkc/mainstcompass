# MainStreet Compass

MainStreet Compass is a polished FBLA demo website that helps users discover and support small local businesses. It uses a map-first experience with live location search, category and rating filters, reviews, favorites, deals, analytics, and a browser-based voice assistant.

## Why this stack

This project uses React + Vite + Tailwind + Leaflet because it is fast to build, looks professional, and deploys well to Vercel with minimal cost. For the competition demo, the app is intentionally built as a static-first SPA so it can run without managing a paid backend.

## Features

- Search any address, city, ZIP code, or landmark
- Ask for the user's current location and show nearby businesses on a map
- Color-coded business pins by category
- Filter by category and minimum rating
- Sort by recommendations, rating, reviews, distance, or deals
- Save favorite businesses to a user-specific list
- Leave 1-5 star reviews with an optional text comment
- Bot-prevention step on reviews using validation, a honeypot field, and a math challenge
- View demo deals and coupon codes from participating businesses
- Analytics dashboard with category totals, summary metrics, top performers, and a downloadable report
- Voice assistant using browser speech recognition for commands like "Find coffee shops" or "Show deals"
- Auth0-ready login flow with a built-in demo account fallback

## Demo content

The app supports searches for any location using OpenStreetMap geocoding and nearby business discovery. It also includes featured Little Rock, Arkansas businesses and promo codes so you have strong demo content tied to your local community.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The app is configured for SPA deployment on Vercel using the included vercel.json file.

## Optional Auth0 setup

If you want to use Auth0 instead of demo login, create a .env file with:

```env
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=optional-api-audience
```

If these variables are not provided, the app uses a local demo account flow so the rest of the features still work during judging.

## Notes for judging

- Reviews, favorites, copied deals, and demo login state are stored in browser localStorage.
- Nearby businesses are fetched from OpenStreetMap services, which lets the project work for user-entered locations beyond Little Rock.
- If a live business lookup service is temporarily unavailable, the app falls back to featured demo content so the demo remains usable.
