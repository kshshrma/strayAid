import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import DiagnosticsView from '@/routes/DiagnosticsView';
import LoginView from '@/routes/LoginView';
import ReportEmergencyView from '@/routes/ReportEmergencyView';
import LiveMapView from '@/routes/LiveMapView';

/**
 * Client-Side Router Configurations.
 * Defines layouts and route mapping rules using modern createBrowserRouter.
 * 
 * SOLID Principle: Open-Closed Principle.
 * The router is open to extensions (we can add more routes as children here easily)
 * but closed to modifications (the main RouterProvider mount remains clean and untouched).
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true, // This marks the home page '/' as rendering DiagnosticsView inside MainLayout
        element: <DiagnosticsView />
      },
      {
        path: 'login',
        element: <LoginView />
      },
      {
        path: 'report',
        element: <ReportEmergencyView />
      },
      {
        path: 'map',
        element: <LiveMapView />
      }
    ]
  }
]);
