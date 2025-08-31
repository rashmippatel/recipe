import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import { describe, it, expect } from 'vitest';

describe('HomePage', () => {
  it('renders CTA buttons', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /Find Recipes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Add Recipe/i })).toBeInTheDocument();
  });
});

