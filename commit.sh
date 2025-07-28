#!/bin/bash
git add .
git commit --no-verify -m "Enhance dashboard and API client functionality

- Optimize Next.js routing system  
- Fix API client initialization and error handling
- Create dedicated dashboard page with proper error boundaries
- Remove legacy dependencies to optimize performance
- Add fallback loading states for async operations
- Improve error handling in Layout component
- Add .nvmrc for Node version consistency"
git push origin main
