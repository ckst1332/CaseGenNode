# Google OAuth with NextAuth

This guide explains how to set up Google authentication in the project using [NextAuth.js](https://next-auth.js.org/). Follow each step carefully to ensure sign-in works locally and on production.

---

## 1. Folder structure

```
CaseGenNode/
├─ pages/
│  ├─ _app.js
│  └─ api/
│     └─ auth/
│        └─ [...nextauth].js
├─ next.config.js
├─ .env.local              # not committed to git
└─ docs/
   └─ auth-setup.md (this file)
```

`pages/api/auth/[...nextauth].js` is the API route that handles authentication. The `_app.js` file wraps the application with the `SessionProvider` so session data is available throughout the UI.

## 2. `pages/api/auth/[...nextauth].js`

```javascript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid email profile" },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
```

This file configures the Google provider and exports the handler for NextAuth. It relies on environment variables set in `.env.local`.

## 3. Environment variables

Create `.env.local` at the project root with the following keys:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=some-session-secret
NEXTAUTH_URL=http://localhost:3000
```

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` come from your Google Cloud Console project.
- `NEXTAUTH_SECRET` can be generated with `openssl rand -base64 32`.
- `NEXTAUTH_URL` is the base URL of the app during development or production (e.g. `https://case-gen-next.vercel.app`).

## 4. `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

The exported object must use `export default`. This ensures API routes are built correctly, preventing errors when deploying to platforms like Vercel.

## 5. Google redirect URI

In the Google Cloud Console OAuth credentials, set the Authorized redirect URI to:

```
https://case-gen-next.vercel.app/api/auth/callback/google
```

For local development, also add:

```
http://localhost:3000/api/auth/callback/google
```

## 6. Basic login page example

```javascript
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn("google")}>Sign in</button>;
  }

  return (
    <div>
      <p>Welcome, {session.user.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
```

Place this component anywhere in your app (e.g. `src/pages/Login.jsx`) to test logging in and out with Google.

## 7. Deployment tips

1. Push your repository to GitHub.
2. Create a new project on [Vercel](https://vercel.com/) and import the repo.
3. Add the same environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) in the Vercel dashboard. Set `NEXTAUTH_URL` to `https://case-gen-next.vercel.app`.
4. Deploy. Vercel will build and host the Next.js app. The API route `/api/auth/[...nextauth]` will handle OAuth callbacks automatically.

## 8. Testing

- Run `npm run dev` and visit `http://localhost:3000`.
- Navigate to your login page and click the **Sign in** button.
- Google should prompt you for consent and then redirect back to the app.
- Verify that `useSession()` returns the logged in user's data.

## 9. Final checklist

- [ ] `pages/api/auth/[...nextauth].js` exists and exports `NextAuth(authOptions)`.
- [ ] `_app.js` wraps the app with `SessionProvider`.
- [ ] `.env.local` contains `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
- [ ] `next.config.js` exports a valid Next.js config object.
- [ ] Google Cloud OAuth redirect URI points to `/api/auth/callback/google`.
- [ ] Login page uses `signIn`, `signOut`, and `useSession` for authentication.
- [ ] App runs locally (`npm run dev`) and authenticates with Google.
- [ ] Deployment (e.g. Vercel) has identical environment variables.

---

You can generate a strong secret with:

```bash
openssl rand -base64 32
```

Store the output as `NEXTAUTH_SECRET` in `.env.local` and in your production environment.
