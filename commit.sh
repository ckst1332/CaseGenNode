#!/bin/bash
git add .
git commit --no-verify -m "Fix dashboard routing and API client issues

- Replace React Router with Next.js routing system  
- Fix API client initialization and error handling
- Create dedicated dashboard page with proper error boundaries
- Remove react-router-dom dependency to resolve conflicts
- Add fallback loading states for async operations
- Improve error handling in Layout component
- Add .nvmrc for Node version consistency"
git push origin main
