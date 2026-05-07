import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  setInitialized: () => set({ initialized: true }),

  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, name });
        set({ user: data.user });
        await get().loadProfile();
      }
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ user: data.user });
      await get().loadProfile();
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  loadProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    set({ user, profile: data ? { ...data, email: user.email } : null });
  },
}));
