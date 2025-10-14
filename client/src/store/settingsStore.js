import { create } from 'zustand';
import api from '../services/api';

const useSettingsStore = create((set, get) => ({
  logoText: 'TBILISI',
  subtitleText: 'Tbilisi',
  goingButtonText: 'მოვდივარ',
  cantGoButtonText: "ვერ მოვდივარ",
  dressCodeLabel: 'დრეს კოდი',
  addressLabel: 'მისამართი',
  eventAgendaLabel: 'წესრიგი',
  guestInfoLabel: 'დამატებითი ინფორმაცია',
  goingButtonColor: '#ffffff',
  goingButtonTextColor: '#000000',
  goingButtonHoverColor: '#f3f4f6',
  cantGoButtonColor: 'transparent',
  cantGoButtonTextColor: '#ffffff',
  cantGoButtonBorderColor: 'rgba(255, 255, 255, 0.3)',
  cantGoButtonHoverColor: 'rgba(255, 255, 255, 0.1)',
  logoImage: null,
  showLinearGradient: true,
  showRadialGradient: true,
  loading: false,
  error: null,
  _pendingUpdates: {},
  _saveTimer: null,

  _extract: (res) => res?.data?.data?.settings ?? res?.data?.data ?? res?.data ?? {},

  _save: async (updates) => {
    try {
      const res = await api.patch('/settings', updates);
      return { success: true, data: res.data };
    } catch (e) {
      if (e?.response?.status === 404 || e?.response?.status === 405) {
        const res = await api.put('/settings', updates);
        return { success: true, data: res.data };
      }
      throw e;
    }
  },

  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      const res = await api.get('/settings');
      set({ ...get()._extract(res), loading: false });
    } catch (e) {
      set({
        error: e.response?.data?.message || 'Failed to fetch settings',
        loading: false,
      });
    }
  },

  updateSettings: async (updates) => {
    try {
      set({ loading: true, error: null });
      const res = await get()._save(updates);
      set({ ...get()._extract(res), loading: false });
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to update settings';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  // Debounced updater to avoid saving on every keystroke
  updateSettingsDebounced: (partial) => {
    // Reflect optimistically in local store for instant UI feedback
    set(partial);
    // Merge into pending updates
    const merged = { ...get()._pendingUpdates, ...partial };
    set({ _pendingUpdates: merged });

    if (get()._saveTimer) {
      clearTimeout(get()._saveTimer);
    }
    const timer = setTimeout(async () => {
      try {
        const res = await get()._save(get()._pendingUpdates);
        set({ ...get()._extract(res), _pendingUpdates: {}, _saveTimer: null });
      } catch (e) {
        // Keep pending values; surface error but don't block typing
        const msg = e.response?.data?.message || 'Failed to update settings';
        set({ error: msg, _saveTimer: null });
      }
    }, 600);
    set({ _saveTimer: timer });
  },

  updateLogoText: (v) => get().updateSettingsDebounced({ logoText: v }),
  updateSubtitleText: (v) => get().updateSettingsDebounced({ subtitleText: v }),
  updateGoingButtonText: (v) => get().updateSettingsDebounced({ goingButtonText: v }),
  updateCantGoButtonText: (v) => get().updateSettingsDebounced({ cantGoButtonText: v }),
  updateDressCodeLabel: (v) => get().updateSettingsDebounced({ dressCodeLabel: v }),
  updateAddressLabel: (v) => get().updateSettingsDebounced({ addressLabel: v }),
  updateEventAgendaLabel: (v) => get().updateSettingsDebounced({ eventAgendaLabel: v }),
  updateGuestInfoLabel: (v) => get().updateSettingsDebounced({ guestInfoLabel: v }),

  updateGoingButtonColor: (v) => get().updateSettingsDebounced({ goingButtonColor: v }),
  updateGoingButtonTextColor: (v) => get().updateSettingsDebounced({ goingButtonTextColor: v }),
  updateGoingButtonHoverColor: (v) => get().updateSettingsDebounced({ goingButtonHoverColor: v }),
  updateCantGoButtonColor: (v) => get().updateSettingsDebounced({ cantGoButtonColor: v }),
  updateCantGoButtonTextColor: (v) => get().updateSettingsDebounced({ cantGoButtonTextColor: v }),
  updateCantGoButtonBorderColor: (v) => get().updateSettingsDebounced({ cantGoButtonBorderColor: v }),
  updateCantGoButtonHoverColor: (v) => get().updateSettingsDebounced({ cantGoButtonHoverColor: v }),

  updateLogoImage: (v) => get().updateSettings({ logoImage: v }),

  updateShowLinearGradient: async (v) => {
    console.log('🔄 Updating linear gradient:', v);
    set({ showLinearGradient: !!v });
    try {
      const r = await get()._save({ showLinearGradient: !!v });
      console.log('📡 Linear gradient API response:', r);
      if (r?.success) {
        set({ ...get()._extract(r) });
        return { success: true };
      } else {
        set({ showLinearGradient: !v });
        return { success: false, error: 'Failed to update linear gradient' };
      }
    } catch (error) {
      console.error('❌ Linear gradient update error:', error);
      set({ showLinearGradient: !v });
      return { success: false, error: error.message || 'Failed to update linear gradient' };
    }
  },
  updateShowRadialGradient: async (v) => {
    console.log('🔄 Updating radial gradient:', v);
    set({ showRadialGradient: !!v });
    try {
      const r = await get()._save({ showRadialGradient: !!v });
      console.log('📡 Radial gradient API response:', r);
      if (r?.success) {
        set({ ...get()._extract(r) });
        return { success: true };
      } else {
        set({ showRadialGradient: !v });
        return { success: false, error: 'Failed to update radial gradient' };
      }
    } catch (error) {
      console.error('❌ Radial gradient update error:', error);
      set({ showRadialGradient: !v });
      return { success: false, error: error.message || 'Failed to update radial gradient' };
    }
  },

  resetToDefaults: async () => {
    try {
      set({ loading: true, error: null });
      const res = await api.post('/settings/reset');
      set({ ...get()._extract(res), loading: false });
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to reset settings';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },
}));

export default useSettingsStore;
