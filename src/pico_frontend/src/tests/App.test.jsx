import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../components/app-routes.tsx';
import { StrictMode } from 'react';

describe('App', () => {
  it('renders landing page by default', () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      </StrictMode>,
    );
    
    // Check if the landing page elements are present
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
    expect(screen.getByText(/Pico/)).toBeInTheDocument();
  });

  it('renders app page when navigating to /app', () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/app']}>
          <AppRoutes />
        </MemoryRouter>
      </StrictMode>,
    );
    
    // Check if the app page elements are present
    expect(screen.getByText(/Pico Greeter/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your name/)).toBeInTheDocument();
  });
});
