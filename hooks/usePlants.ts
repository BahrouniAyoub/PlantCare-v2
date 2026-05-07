import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Plant } from '@/types';

export function usePlants() {
  const { user } = useAuthStore();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlants = useCallback(async () => {
    if (!user?.id) {
      setPlants([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('plants')
        .select('*, device:devices!plants_device_id_fkey(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (err) {
        console.error('Failed to load plants:', err);
        setError(err.message);
        return;
      }

      setPlants(data ?? []);
    } catch (e: any) {
      console.error('Failed to load plants:', e);
      setError(e.message ?? 'Failed to load plants.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { plants, loading, error, loadPlants, fetchPlants: loadPlants };
}
