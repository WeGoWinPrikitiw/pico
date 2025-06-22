# Pico Frontend - Project Structure

## Overview
The frontend has been restructured to provide better maintainability, reusability, and scalability. The app now uses React Router for navigation with a landing page at `/` and the main application at `/app`.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components
│   │   ├── header.tsx  # Navigation header
│   │   ├── layout.tsx  # Main layout wrapper
│   │   └── index.ts    # Barrel exports
│   ├── ui/            # UI components (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── error-message.tsx
│   │   └── index.ts    # Barrel exports
│   └── app-routes.tsx  # Route definitions
├── hooks/              # Custom React hooks
│   ├── useAsync.ts     # Async operation handling
│   └── index.ts        # Barrel exports
├── pages/              # Page components
│   ├── landing.tsx     # Landing page (/)
│   ├── app-page.tsx    # Main app page (/app)
│   └── index.ts        # Barrel exports
├── lib/               # Utility functions
│   └── utils.ts       # Common utilities
├── tests/             # Test files
└── App.tsx            # Main app with router setup
```

## Routes

- **`/`** - Landing page with hero section and feature highlights
- **`/app`** - Main application (greeting functionality)

## Key Features

### 1. React Router Navigation
- Clean separation between landing and app pages
- Header navigation between routes
- Browser history support

### 2. Reusable Components
- **UI Components**: Button, Input, LoadingSpinner, ErrorMessage
- **Layout Components**: Header, Layout wrapper
- **Barrel Exports**: Clean imports via index files

### 3. Custom Hooks
- **useAsync**: Handles async operations with loading, error, and data states
- Type-safe with TypeScript interfaces
- Centralized error handling

### 4. Improved User Experience
- Loading states for async operations
- Error handling with retry functionality
- Responsive design with Tailwind CSS
- Accessible components with proper ARIA labels

### 5. Better Code Organization
- Clear separation of concerns
- TypeScript for type safety
- Modular architecture
- Easy to extend and maintain

## Component Examples

### Using useAsync Hook
```tsx
const greetAsync = useAsync(
  (name: string) => pico_backend.greet(name),
  []
);

// Usage
greetAsync.execute(userName);

// States available: loading, error, data
```

### Clean Imports
```tsx
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAsync } from '@/hooks';
import { Layout } from '@/components/layout';
```

## Testing
- Updated tests to work with routing
- Separated route testing from router testing
- Uses MemoryRouter for controlled test environments

## Development
```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
``` 