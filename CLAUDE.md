# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - starts the Next.js development server at http://localhost:3000
- **Build**: `npm run build` - generates Prisma client and builds the Next.js application for production
- **Start**: `npm run start` - runs the built application in production mode
- **Lint**: `npm run lint` - runs ESLint on the codebase
- **Type checking**: `npx tsc --noEmit` - runs TypeScript type checking without emitting files
- **Prisma studio**: `npx prisma studio` - opens the Prisma database GUI
- **Generate Prisma client**: `npx prisma generate` - generates Prisma client from schema (runs automatically on dev/build/postinstall)

## Code Architecture & Structure

### Application Routing
The app uses Next.js App Router with role-based route grouping:
- `(public)` - Publicly accessible pages (landing page)
- `(auth)` - Authentication pages (login, register)
- `admin` - Administrative dashboard and management features
- `dept` - Department-level features (event proposals, attendance, reports)
- `student` - Student-facing features (event browsing, QR code generation, attendance history)
- `scanner` - QR code scanning interface for event check-ins
- `api` - Route handlers for backend functionality organized by role/resource

### Key Directories
- `src/components` - Reusable UI components (shadcn/ui based) organized by feature/category
- `src/components/ui` - Primitive UI components (button, input, modal, etc.)
- `src/components/layout` - Layout components (sidebar, navbar)
- `src/lib` - Utility functions and service integrations (Supabase, Prisma, QR code generation)
- `src/hooks` - Custom React hooks (auth, toast, real-time, scanner)
- `src/types` - TypeScript type definitions
- `src/app` - App router pages and route handlers

### Data Layer
- **ORM**: Prisma with PostgreSQL (via Supabase)
- **Schema**: Located in `prisma/schema.prisma` 
- **Client**: Generated at `node_modules/.prisma/client`
- **Seed**: `prisma/seed.ts` for initial data population
- **Supabase**: Used for authentication and real-time subscriptions via `@supabase/supabase-js`

### Authentication
- Supabase authentication with JWT tokens
- Custom auth utilities in `src/lib/auth.ts` and `src/lib/supabase.ts`/`src/lib/supabase-server.ts`
- Role-based access controlled via route protection and API route middleware
- Hooks: `use-auth.ts` for client-side auth state management

### Styling
- TailwindCSS v4 with custom configuration in `tailwind.config.ts` (implicit)
- CSS reset and base styles in `src/globals.css`
- Component styling uses Tailwind utility classes and class-variance-authority for variants
- Dark mode support via `className` strategy

### Real-time Features
- Supabase real-time subscriptions for live updates
- Custom hook `use-real-time.ts` for subscribing to database changes
- Used for live attendance updates, notification feeds, and proposal status changes

### QR Code Functionality
- QR code generation using `qrcode` and `qrcode.react` packages
- Custom utilities in `src/lib/qr.ts`
- Scanner interface uses `html5-qrcode` for camera-based scanning
- Routes: `/scanner/scan` for processing scanned data, `/student/qr-code` for displaying QR codes

### API Routes
All API routes follow REST conventions and are protected with authentication middleware:
- `POST /api/auth/*` - Registration, login, logout
- `GET/POST /api/admin/*` - Administrative operations (events, proposals, reports, admins, students)
- `GET/POST /api/dept/*` - Department operations (events, proposals, reports)
- `GET/POST /api/student/*` - Student operations (profile, attendance)
- `POST /api/scanner/*` - Scanner operations (scan processing, PIN validation)
- `GET/POST /api/notifications/*` - Notification handling

### State Management
- React hooks for local state (`useState`, `useEffect`)
- Custom hooks for shared logic (auth, toast, real-time)
- React Query/SWR not used - data fetching done directly in route loaders and with useEffect
- Toast notifications via `sonner` and `use-toast.ts` hook

### Testing
No test framework configured in package.json. Testing would need to be added separately.