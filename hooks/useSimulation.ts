import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { runDeviceTick } from '@/services/simulation';

// Runs the simulation engine in the frontend every 5 seconds for the current user's devices.
// This is a frontend-driven simulation that mimics what a backend cron job would do.
export function useSimulation(userId: string | undefined) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const tick = async () => {
      const { data: devices } = await supabase
        .from('devices')
        .select('*')
        .eq('owner_id', userId)
        .eq('type', 'simulated');

      if (!devices) return;

      for (const device of devices) {
        await runDeviceTick(device, userId);
      }
    };

    // Run immediately on mount
    tick();

    intervalRef.current = setInterval(tick, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);
}
