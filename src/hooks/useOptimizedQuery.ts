
import { useQuery } from '@tanstack/react-query';
import { apiCache } from '@/utils/performance';

interface UseOptimizedQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
}

export const useOptimizedQuery = ({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  enabled = true
}: UseOptimizedQueryOptions) => {
  const cacheKey = queryKey.join('-');
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Check cache first
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }

      // Fetch fresh data
      console.log(`Fetching fresh data for ${cacheKey}`);
      const data = await queryFn();
      
      // Cache the result
      apiCache.set(cacheKey, data);
      
      return data;
    },
    staleTime,
    gcTime: cacheTime,
    enabled,
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    retry: (failureCount, error) => {
      // Only retry on network errors, not 4xx/5xx
      return failureCount < 2 && !error.message.includes('4') && !error.message.includes('5');
    }
  });
};
