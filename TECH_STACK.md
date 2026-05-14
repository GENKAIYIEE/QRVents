# QRVents Technology Stack

This document outlines the comprehensive technology stack used in the QRVents project, based on the project's configuration and dependencies.

## 1. Core Framework & Language
* **Next.js (v16.2.6)**: The core React framework handling server-side rendering, routing, and API endpoints.
* **React (v19.2.4)**: The foundational UI library for building components.
* **TypeScript (v5)**: Providing static typing across frontend and backend code for better reliability and developer experience.
* **Node.js**: The underlying JavaScript runtime environment.

## 2. Database & Backend
* **Prisma (v6.19.3)**: Object-Relational Mapper (ORM) used to model data (`schema.prisma`) and interact with the database in a type-safe manner.
* **Supabase**: Used as the underlying PostgreSQL database provider. The project includes `@supabase/supabase-js` and `@supabase/ssr` SDKs for authentication or direct client/server integrations.

## 3. Styling & UI Architecture
* **Tailwind CSS (v4)**: The primary utility-first CSS framework, utilizing the newly released v4 engine (`@tailwindcss/postcss`).
* **Radix UI**: A collection of unstyled, accessible UI components serving as the foundation for interactive elements:
  * Avatar, Dialog, Dropdown Menu, Popover, Progress, Select, Separator, Switch, Tabs, Tooltip.
* **Framer Motion**: Used for fluid animations and page transitions.
* **Lucide React**: The primary SVG icon library.
* **Tailwind Merge (`tailwind-merge`) & `clsx`**: Utilities used (often combined as a `cn` utility) to cleanly merge and conditionally apply Tailwind classes without styling conflicts.
* **Class Variance Authority (`cva`)**: Used to create reusable, variant-based UI components (like buttons with different sizes and colors).

## 4. Forms & Validation
* **React Hook Form**: Used to manage complex form states, inputs, and submissions efficiently.
* **Zod**: Used for strict schema validation, ensuring the data users submit matches expected database structures.
* **@hookform/resolvers**: Bridges Zod validation schemas with React Hook Form.

## 5. Authentication & Security
* **Bcrypt.js**: Used for securely hashing user passwords before storing them in the database.
* **Jose & JSON Web Token (JWT)**: Handling secure, stateless authentication tokens and session management.

## 6. QR Code Management
* **HTML5-QRCode**: Provides functionality for scanning QR codes directly via the device's camera.
* **QRCode.react & QRCode**: For dynamically generating and rendering QR codes on the screen.

## 7. Data Visualization & Exports
* **Recharts**: A composable charting library built on React components for rendering data charts and analytics dashboards.
* **jsPDF & jsPDF-Autotable**: Libraries for generating and formatting downloadable PDF reports on the client side.
* **XLSX**: Used for parsing and exporting data to Excel spreadsheets.

## 8. Development & Linting Tools
* **ESLint**: Linter for identifying and fixing problematic patterns in JavaScript/TypeScript code.
* **ts-node**: Executing TypeScript files directly (used primarily for running database seeds via `prisma/seed.ts`).
