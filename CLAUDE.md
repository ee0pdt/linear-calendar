# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (runs Vite build + TypeScript compilation)
- `npm run test` - Run Vitest tests
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run check` - Auto-fix with Prettier and ESLint

## Architecture

This is a React application built with:

- **Vite** as the build tool and dev server
- **TanStack Router** for file-based routing with automatic code splitting
- **Tailwind CSS v4** for styling
- **TypeScript** with strict mode enabled
- **Vitest** for testing with jsdom environment

### Key Architecture Points

- **File-based routing**: Routes are defined as files in `src/routes/` directory
- **Route tree generation**: TanStack Router automatically generates `routeTree.gen` from route files
- **Layout system**: Root layout is in `src/routes/__root.tsx` with `<Outlet />` for route content
- **Type safety**: Router instance is registered globally for TypeScript inference
- **Path aliases**: `@/*` maps to `./src/*` for imports

### Router Configuration

The router is configured with:
- Intent-based preloading
- Scroll restoration
- Structural sharing enabled
- Zero preload stale time

### Testing Setup

- Uses Vitest with jsdom environment
- Testing utilities: `@testing-library/react` and `@testing-library/dom`
- Global test configuration in `vite.config.js`