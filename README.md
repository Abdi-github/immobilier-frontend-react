# Immobilier Frontend (React)

Public-facing frontend for the Swiss real-estate platform inspired by [immobilier.ch](https://www.immobilier.ch/en/).

## Tech Stack

| Area          | Technology                     |
| ------------- | ------------------------------ |
| Framework     | React 18                       |
| Language      | TypeScript (strict)            |
| Build Tool    | Vite 6                         |
| Styling       | Tailwind CSS v4                |
| UI Components | shadcn/ui (Radix primitives)   |
| State         | Redux Toolkit + RTK Query      |
| Forms         | React Hook Form + Zod          |
| i18n          | react-i18next (EN, FR, DE, IT) |
| Icons         | Lucide React                   |
| Unit Testing  | Vitest + React Testing Library |
| E2E Testing   | Playwright                     |
| Containers    | Docker                         |
| Production    | Nginx                          |

## Features

- Homepage with hero search, featured properties, city cards
- Property listing with grid/list views, filtering, sorting, pagination
- Property detail page with image gallery, amenities, contact form
- Advanced search with location, price, rooms, and category filters
- Multi-language support (EN, FR, DE, IT) with URL-based routing
- User authentication (login, register)
- Agent dashboard (profile, properties, settings)
- Favorites and saved searches
- Responsive design (mobile-first)
- Loading skeletons and error boundaries

## Quick Start

### Prerequisites

- Docker & Docker Compose
- **The API must be running first** (creates the shared Docker network)

### Development (Docker)

```bash
# 1. Start the API first (creates immobilier_network)
cd ../immobilier-api-node
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 2. Start the frontend
cd ../immobilier-frontend-react
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Development (Local)

```bash
npm install
npm run dev
```

### Access

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:5173        |
| API      | http://localhost:4003/api/v1 |

## Project Structure

```
src/
├── app/              # Redux store, router, providers
├── features/         # Feature modules
│   ├── home/         # Homepage (hero, featured, city cards)
│   ├── properties/   # Property listing & detail
│   ├── search/       # Search & filters
│   ├── auth/         # Authentication
│   ├── dashboard/    # User/agent dashboard
│   ├── favorites/    # Saved properties
│   ├── agencies/     # Agency pages
│   └── static/       # About, terms, privacy, contact
├── shared/           # Shared API, components, hooks, utils, types
│   ├── api/          # RTK Query base API
│   ├── components/   # shadcn/ui components
│   ├── hooks/        # Custom hooks
│   ├── state/        # Redux slices
│   └── utils/        # Formatters, validators, constants
├── layouts/          # MainLayout, AuthLayout, DashboardLayout
├── routes/           # Route definitions
├── i18n/             # i18n config + locale files (en, fr, de, it)
└── styles/           # Global CSS + Tailwind theme
```

## Environment Variables

Copy `.env.example` or use Docker Compose env vars:

```env
VITE_API_BASE_URL=http://localhost:4003/api/v1
VITE_APP_NAME=Immobilier.ch
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,fr,de,it
VITE_CLOUDINARY_CLOUD_NAME=dzyyygr1x
```

## Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Start Vite dev server    |
| `npm run build`         | Production build         |
| `npm run preview`       | Preview production build |
| `npm run lint`          | Run ESLint               |
| `npm run format`        | Format code              |
| `npm run test`          | Run unit tests (Vitest)  |
| `npm run test:coverage` | Unit tests with coverage |
| `npm run test:e2e`      | Run Playwright E2E tests |

## Testing

### Unit Tests (149 tests)

```bash
npm run test
```

### E2E Tests (41 tests)

```bash
# Requires API + Frontend running
npx playwright test
```

## Networking

This repo joins the `immobilier_network` created by the API repo.

## Related Repos

| Repo                     | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `immobilier-api-node`    | REST API (Node.js/Express) — **must run first** |
| `immobilier-admin-react` | Admin Dashboard (React + Bootstrap)             |

## License

MIT
