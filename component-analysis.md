# Component Migration Analysis

## Architecture Overview:
ACTIVE (Next.js Pages)          INACTIVE (React Router)
├── pages/index.js              ├── src/pages/Landing.jsx
├── pages/dashboard.js          ├── src/pages/Dashboard.jsx  
├── pages/generate.js           ├── src/pages/Generate.jsx
├── pages/account.js            ├── src/pages/Account.jsx
├── pages/cases.js              ├── src/pages/Cases.jsx
├── pages/case.js               ├── src/pages/Case.jsx
├── pages/payments.js           ├── src/pages/Payments.jsx
├── pages/login.js              ├── src/pages/Login.jsx
└── pages/signup.js             └── src/pages/Signup.jsx

## Current Import Pattern:
- Next.js pages import React Router components from /src/pages/
- Example: pages/index.js imports Landing from '../src/pages/Landing'
- This creates a hybrid system with routing conflicts

## Business Logic Analysis:

## Component Complexity Analysis:

### HIGH COMPLEXITY (>200 lines):
- Generate.jsx (718 lines): Complex state (5+ useState), LLM integration, file generation
- Landing.jsx (441 lines): Marketing content, animations, complex layout
- Account.jsx (238 lines): User profile, subscription management, credit display
- Case.jsx (219 lines): Individual case view, results entry, scoring logic

### MEDIUM COMPLEXITY (100-200 lines):
- Layout.jsx (186 lines): Navigation, authentication checks, sidebar
- Cases.jsx (126 lines): List view, filtering, search functionality
- Signup.jsx (109 lines): Registration form, validation
- Dashboard.jsx (106 lines): Analytics, recent cases, performance tips

### LOW COMPLEXITY (<100 lines):
- index.jsx (93 lines): Route definitions
- Login.jsx (93 lines): Authentication forms
- Payments.jsx (38 lines): Stripe integration (minimal)

## State Management Patterns:

- Generate.jsx: 6 useState hooks (complex state management)
- Case.jsx: 7 useState hooks (most complex state)
- Account.jsx: 3 useState hooks (moderate state)

## Dependencies and Integrations:

### Generate.jsx Dependencies:
- InvokeLLM (AI integration)
- User.me(), User.updateMyUserData() (User API)
- Case.create() (Case API)
- createPageUrl() (React Router navigation)
- navigate() (React Router)

### Critical Migration Points:
1. Replace createPageUrl() with Next.js routes
2. Replace navigate() with Next.js router.push()
3. Preserve LLM integration logic
4. Maintain state management patterns
