# CaseGen

A Next.js application for generating and managing AI-powered financial modeling case studies. Successfully migrated from hybrid React Router + Next.js to pure Next.js architecture.

## 🎯 Features

- **AI-Powered Case Generation**: Generate realistic DCF modeling challenges with self-correcting AI
- **User Management**: Google OAuth authentication with credit-based system
- **Case Workflow**: Complete case lifecycle from generation to completion with results comparison
- **Payment Integration**: Stripe-powered subscription management
- **Test User System**: Unlimited credits for development and testing

## Running the app

```bash
npm install
npm run dev      # start the Next.js frontend
```

## 🛠️ Architecture

**Pure Next.js Application** (migrated from React Router hybrid)
- **Frontend**: Next.js pages with server-side rendering
- **API**: Next.js API routes for backend functionality  
- **Database**: Supabase for data persistence
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: Stripe for subscription management
- **AI Integration**: Custom LLM integration for case generation

## ⚙️ Environment Setup

Copy `.env.local.example` to `.env.local` and configure the required values:

```bash
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Authentication (Required)  
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=some-session-secret
NEXTAUTH_URL=http://localhost:3000

# Payments (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...
```

### Test User Access
For development and testing, use the test user account:
- **Email**: `jeff.sit13@gmail.com`
- **Credits**: Unlimited (999,999)
- **Features**: Full access to all functionality

## 🚀 Deployment

```bash
npm run build    # build for production
npm start        # start production server
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📁 Project Structure

```
📁 /pages/                    # Next.js pages (routing)
   ├── index.js               # Landing page wrapper  
   ├── dashboard.js           # Dashboard
   ├── generate.js            # Case generation
   ├── cases.js               # Cases list
   ├── case.js                # Individual case view
   ├── account.js             # User account
   ├── payments.js            # Subscription management
   └── api/                   # API routes

📁 /components/layout/         # Shared layout components
   └── Layout.jsx             # Main app layout

📁 /src/                      # Business logic & components
   ├── /api/                  # Centralized API client
   ├── /components/           # Reusable components
   ├── /pages/                # Contains Landing.jsx only
   └── /lib/                  # Utility libraries

📁 /lib/                      # Server-side utilities
   ├── supabase.js            # Database client
   └── utils.js               # Server utilities
```

## 🔧 API Endpoints

### User Management
- `GET /api/users/me` - Get current user data
- `PATCH /api/users/me` - Update user data

### Case Management  
- `GET /api/cases` - List user's cases
- `POST /api/cases` - Create new case
- `GET /api/cases/[id]` - Get specific case
- `PATCH /api/cases/[id]` - Update case

### AI Integration
- `POST /api/integrations/invoke-llm` - Generate case content

### Debug Endpoints
- `GET /api/debug/test-user-check` - Verify test user status
- `GET /api/debug/env-check` - Check environment variables

## 🎯 Migration Status

✅ **Successfully migrated from React Router + Next.js hybrid to pure Next.js**
- Eliminated dual routing conflicts
- Consolidated API client architecture  
- Optimized bundle size (-16% dependencies)
- Maintained 100% feature parity

For detailed migration information, see [`MIGRATION-COMPLETE.md`](./MIGRATION-COMPLETE.md).
