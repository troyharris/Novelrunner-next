# Technical Context

## Development Environment

### Core Technologies

1. **Frontend Framework**

   - Next.js 14+ (App Router)
   - React 18+
   - TypeScript 5+

2. **Styling**

   - Tailwind CSS
   - PostCSS for processing
   - CSS Modules for component-specific styles

3. **Backend Services**

   - Supabase for:
     - PostgreSQL database
     - Authentication
     - Real-time subscriptions
     - File storage
   - OpenRouter for AI integration

4. **Development Tools**
   - Node.js (Latest LTS)
   - npm for package management
   - ESLint for code linting
   - TypeScript for type checking

### Project Configuration

1. **Next.js Config**

   ```typescript
   // next.config.ts
   const config = {
     // Using App Router
     experimental: {
       serverActions: true,
     },
     // Image optimization
     images: {
       domains: ["*.supabase.co"],
     },
   };
   ```

2. **TypeScript Config**

   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "target": "es5",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "strict": true,
       "forceConsistentCasingInFileNames": true,
       "noEmit": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "preserve",
       "incremental": true,
       "plugins": [
         {
           "name": "next"
         }
       ]
     }
   }
   ```

3. **Tailwind Config**
   ```typescript
   // tailwind.config.ts
   module.exports = {
     content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
     theme: {
       extend: {
         // Custom theme extensions
       },
     },
     plugins: [],
   };
   ```

## Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "latest",
    "@supabase/auth-helpers-nextjs": "latest",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

## External Services

### 1. Supabase

#### Production Environment

- PostgreSQL database
- Row Level Security (RLS) policies
- Real-time subscriptions
- Storage buckets for manuscripts
- Authentication with multiple providers
- URL: https://ooopikjcclqqfsoycwuo.supabase.co

#### Local Development Environment

- Docker-based local Supabase instance
- Full feature parity with production
- Local URLs:
  - Studio: http://127.0.0.1:54323
  - API: http://127.0.0.1:54321
  - Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
  - Email testing: http://127.0.0.1:54324

#### Database Management

- Migrations in `/supabase/migrations/`
- Seed data in `/supabase/seed.sql`
- TypeScript type generation from schema
- npm scripts for database operations:
  ```bash
  npm run db:start    # Start local instance
  npm run db:stop     # Stop local instance
  npm run db:reset    # Reset with migrations & seed
  npm run db:types    # Generate TypeScript types
  ```

#### Environment Configuration

- `.env.local` - Production settings
- `.env.development.local` - Local development settings
- Automatic switching between environments

### 2. OpenRouter

- AI model access
- API key required
- Rate limiting considerations
- Multiple model support

### 3. Vercel

- Production hosting
- Automatic deployments
- Edge functions
- Analytics and monitoring

## Development Workflow

1. **Local Development**

   ```bash
   npm run dev     # Start development server
   npm run build   # Production build
   npm run start   # Start production server
   npm run lint    # Run ESLint
   ```

2. **Database Migrations**

   - Located in /supabase/migrations
   - Sequential numbering (001, 002, etc.)
   - Descriptive names
   - Review required before execution

3. **Deployment**
   - Automatic deployment from main branch
   - Preview deployments for pull requests
   - Environment variable management in Vercel

## Security Considerations

1. **Authentication**

   - Supabase handles user sessions
   - Protected API routes
   - Middleware for route protection

2. **Database Security**

   - Row Level Security (RLS)
   - Prepared statements
   - Input validation

3. **API Security**

   - Rate limiting
   - CORS configuration
   - API key management

4. **Environment Variables**
   - Stored in Vercel
   - Local .env file (not in version control)
   - Type-safe environment variables

## Performance Optimization

1. **Build Optimization**

   - Code splitting
   - Tree shaking
   - Image optimization

2. **Runtime Optimization**

   - Server components
   - Edge functions where applicable
   - Caching strategies

3. **Database Optimization**
   - Indexed queries
   - Connection pooling
   - Query optimization

## Monitoring and Debugging

1. **Error Tracking**

   - Client-side error boundaries
   - Server-side error logging
   - API error handling

2. **Performance Monitoring**

   - Vercel Analytics
   - Custom performance metrics
   - User behavior tracking

3. **Logging**
   - Development logs
   - Production error tracking
   - Security audit logs
