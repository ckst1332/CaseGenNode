# CaseGen

This project is built with Next.js and React for generating and managing practice cases.

## Running the app

```bash
npm install
npm run dev      # start the Next.js frontend
npm run server   # start backend
```

### Google authentication

Create a `.env` file with the following variables to enable logging in with Gmail:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=some-session-secret
NEXTAUTH_URL=http://localhost:3000
```

Once configured, clicking "Continue with Google" on the Login or Signup pages will start the Google login flow using NextAuth.

## Building the app

```bash
npm run build
npm start        # start the production server
```

## Payments configuration

Create a `.env` file based on `.env.example` and set `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` to the payment link generated in your Stripe account.
