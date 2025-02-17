# NovelRunner

A structured way to write novels using serialized television storytelling principles.

## Database Development

The project uses Supabase for the database. Here's how to work with the database during development:

### Prerequisites

1. Install Docker Desktop
2. Install Supabase CLI
3. Copy `.env.development.local` for local development settings

### Commands

```bash
# Start the local Supabase instance
npm run db:start

# Stop the local Supabase instance
npm run db:stop

# Reset the database (applies migrations and seed data)
npm run db:reset

# Generate TypeScript types from the database schema
npm run db:types

# Open Supabase Studio in your browser
npm run db:studio
```

### Database URLs

- Studio URL: http://127.0.0.1:54323
- Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- API URL: http://127.0.0.1:54321
- Inbucket URL: http://127.0.0.1:54324 (for email testing)

### Migrations

Database migrations are stored in `/supabase/migrations` and are automatically applied when running `db:reset`. To create a new migration:

1. Make your changes in Supabase Studio
2. Use `supabase db diff -f migration_name` to generate the migration file
3. Add the migration file to version control

### Development Workflow

1. Start the database: `npm run db:start`
2. Make changes in Supabase Studio: `npm run db:studio`
3. Generate a migration: `supabase db diff -f your_migration_name`
4. Test the migration: `npm run db:reset`
5. Generate updated types: `npm run db:types`
6. Commit changes

### Environment Variables

The project uses two sets of environment variables:

- `.env.local` - Production Supabase settings
- `.env.development.local` - Local development settings

This allows you to switch between the production database and local development database as needed.
