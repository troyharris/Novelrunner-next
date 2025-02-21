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
   - OpenRouter for AI integration (pending)

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

#### Database Schema

Current tables and relationships:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  target_word_count INTEGER NOT NULL,
  pace TEXT NOT NULL,
  cover_color TEXT,
  episode_count INTEGER,
  words_written INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Episodes table
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_word_count INTEGER NOT NULL,
  current_word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Scenes table (planned)
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Security Policies

```sql
-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Similar policies for episodes and scenes
```

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

### 2. Authentication

#### Implementation

```typescript
// src/lib/supabase/server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const createClient = (cookies: any) => {
  return createServerComponentClient({
    cookies,
  });
};

// src/middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}
```

#### Protected Routes

- Middleware checks for authentication
- Server-side session validation
- Client-side auth state management
- Secure redirect handling

### 3. OpenRouter (Planned)

- AI model access
- API key required
- Rate limiting considerations
- Multiple model support

### 4. Vercel

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
   - Secure session management

2. **Database Security**

   - Row Level Security (RLS)
   - Prepared statements
   - Input validation
   - User-specific policies

3. **API Security**

   - Rate limiting
   - CORS configuration
   - API key management
   - Request validation

4. **Environment Variables**
   - Stored in Vercel
   - Local .env file (not in version control)
   - Type-safe environment variables

## Performance Optimization

1. **Build Optimization**

   - Code splitting
   - Tree shaking
   - Image optimization
   - Route prefetching

2. **Runtime Optimization**

   - Server components
   - Edge functions where applicable
   - Caching strategies
   - Optimistic updates

3. **Database Optimization**
   - Indexed queries
   - Connection pooling
   - Query optimization
   - Efficient joins

## Monitoring and Debugging

1. **Error Tracking**

   - Client-side error boundaries
   - Server-side error logging
   - API error handling
   - Custom error pages

2. **Performance Monitoring**

   - Vercel Analytics
   - Custom performance metrics
   - User behavior tracking
   - API response times

3. **Logging**
   - Development logs
   - Production error tracking
   - Security audit logs
   - Database query logs
