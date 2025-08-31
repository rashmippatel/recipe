import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import RootLayout from './routes/RootLayout';
import HomePage from './routes/HomePage';
import FindPage from './routes/FindPage';
import FavoritesListPage from './routes/favorites/FavoritesListPage';
import FavoriteDetailPage from './routes/favorites/FavoriteDetailPage';
import FavoriteEditPage from './routes/favorites/FavoriteEditPage';
import LegalPage from './routes/LegalPage';
import NotFoundPage from './routes/NotFoundPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'find', element: <FindPage /> },
      { path: 'favorites', element: <FavoritesListPage /> },
      { path: 'favorites/new', element: <FavoriteEditPage mode="create" /> },
      { path: 'favorites/:id', element: <FavoriteDetailPage /> },
      { path: 'favorites/:id/edit', element: <FavoriteEditPage mode="edit" /> },
      { path: 'legal/:page', element: <LegalPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

