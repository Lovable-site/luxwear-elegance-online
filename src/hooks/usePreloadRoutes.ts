
import { useEffect } from 'react';

const routeModules = {
  '/products': () => import('../pages/Products'),
  '/cart': () => import('../pages/Cart'),
  '/checkout': () => import('../pages/Checkout'),
  '/contact': () => import('../pages/Contact'),
} as const;

export const usePreloadRoutes = () => {
  useEffect(() => {
    // Preload critical routes after initial load
    const preloadTimer = setTimeout(() => {
      Object.values(routeModules).forEach(importFn => {
        importFn().catch(() => {
          // Silently fail - not critical
        });
      });
    }, 2000); // Preload after 2 seconds

    return () => clearTimeout(preloadTimer);
  }, []);

  const preloadRoute = (route: keyof typeof routeModules) => {
    if (routeModules[route]) {
      routeModules[route]().catch(() => {
        // Silently fail - not critical
      });
    }
  };

  return { preloadRoute };
};
