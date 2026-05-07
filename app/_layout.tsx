import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  useFrameworkReady();
  const { loadProfile, setInitialized } = useAuthStore();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          await loadProfile();
        } else {
          useAuthStore.setState({ user: null, profile: null });
        }
        setInitialized();
      })();
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile();
      }
      setInitialized();
    })();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-plant" options={{ presentation: 'modal' }} />
        <Stack.Screen name="plant/[id]" />
        <Stack.Screen name="device/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
