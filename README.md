# CaseGen

This project is built with Next.js and React for generating and managing practice cases.

## Running the app

```bash
npm install
npm run dev      # start the Next.js frontend
```

### Google authentication

Copy `.env.example` to `.env` and fill in the required values:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=some-session-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=
```

Once configured, clicking "Continue with Google" on the Login or Signup pages will start the Google login flow using NextAuth.

## Building the app

```bash
npm run build
npm start        # start the production server
```

## Payments configuration

Ensure `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` in your `.env` points to the payment link generated in your Stripe account.
