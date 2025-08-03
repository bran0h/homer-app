# Homer

Your personal dashboard for home management.

## Installation

1. Clone the repository
2. Setup Supabase
3. Copy `.env.example` to `.env` and fill in the required variables
4. Install dependencies

```bash
pnpm install
```

5. Generate Supabase types

```bash
pnpx supabase gen types --lang=typescript --project-id <your_project_id> > shared/types/supabase.types.ts
```

6. Run the development server

```bash
pnpm run dev
```
