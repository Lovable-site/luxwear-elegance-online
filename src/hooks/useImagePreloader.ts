
import { useEffect } from 'react';

export const useImagePreloader = (imageUrls: string[]) => {
  useEffect(() => {
    if (!imageUrls.length) return;

    const preloadImages = () => {
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    // Preload images after a short delay to not block initial render
    const timer = setTimeout(preloadImages, 1000);
    
    return () => clearTimeout(timer);
  }, [imageUrls]);
};
