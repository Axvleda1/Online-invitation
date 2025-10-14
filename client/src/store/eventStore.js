import { create } from 'zustand';
import api from '../services/api';

const listFrom = (res) =>
  res?.data?.data?.events ??
  res?.data?.events ??
  res?.data?.data ??
  res?.data ??
  [];

const oneFrom = (res) =>
  res?.data?.data ??
  res?.data ??
  null;

const useEventStore = create((set, get) => ({
  events: [],
  activeEvent: null,
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchActiveEvent: async () => {
    try {
      const res = await api.get('/events/active');
      set({ activeEvent: oneFrom(res) });
    } catch (e) {
      console.error('Fetch active event error:', e);
    }
  },

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/events');
      set({ events: listFrom(res), isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e?.response?.data?.message || 'Failed to fetch events' });
    }
  },

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      console.log(eventData)
      const res = await api.post('/events', eventData);
      set({ isLoading: false });
      get().fetchEvents();
      return { success: true, data: oneFrom(res) };
    } catch (e) {
      const msg = e?.response?.data?.message || 'Create failed';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put(`/events/${id}`, eventData);
      set({ isLoading: false });
      get().fetchEvents();
      return { success: true, data: oneFrom(res) };
    } catch (e) {
      const msg = e?.response?.data?.message || 'Update failed';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  deleteEvent: async (id) => {
    try {
      await api.delete(`/events/${id}`);
      get().fetchEvents();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || 'Delete failed';
      return { success: false, error: msg };
    }
  },

  toggleEventStatus: async (id) => {
    try {
      await api.patch(`/events/${id}/toggle-status`);
      get().fetchEvents();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || 'Toggle failed';
      return { success: false, error: msg };
    }
  },

  addAgendaItem: async (eventId, agendaItem) => {
    try {
      await api.post(`/events/${eventId}/agenda`, agendaItem);
    get().fetchEvents();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || 'Add failed';
      return { success: false, error: msg };
    }
  },

  deleteAgendaItem: async (eventId, agendaId) => {
    try {
      await api.delete(`/events/${eventId}/agenda/${agendaId}`);
      get().fetchEvents();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || 'Delete failed';
      return { success: false, error: msg };
    }
  },

  setSelectedEvent: (event) => set({ selectedEvent: event }),
}));

export default useEventStore;
