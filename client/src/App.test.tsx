import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it } from 'vitest';
import RootLayout from './routes/RootLayout';

describe('RootLayout', () => {
  it('mounts without crashing', () => {
    render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    );
  });
});

