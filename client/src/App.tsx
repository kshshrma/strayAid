import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';

/**
 * Root React Component.
 * Binds and mounts the React RouterProvider to drive page routing.
 * 
 * SOLID Principle: Single Responsibility.
 * The App component is now solely responsible for hosting the routing engine provider.
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
