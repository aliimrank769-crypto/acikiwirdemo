import { useEffect, useState } from 'react';

export type DeviceTier = 'mobile' | 'tablet' | 'desktop';

function detectTier(width: number): DeviceTier {
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(() =>
    typeof window !== 'undefined' ? detectTier(window.innerWidth) : 'desktop'
  );

  useEffect(() => {
    const handleResize = () => {
      const next = detectTier(window.innerWidth);
      setTier((prev) => (prev === next ? prev : next));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return tier;
}

