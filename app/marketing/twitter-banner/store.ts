import { create } from "zustand";

// Conversion factor: multiply Three.js units by this to get pixels
export const unitToPixel = 600;

export interface TextConfig {
  fontSize: number;
  color: string;
  letterSpacing: number;
  text: string;
  position: { x: number; y: number };
}

export interface BackgroundConfig {
  fogDensity: number;
  gridOpacity: number;
  animationPaused: boolean;
  animationTime: number;
}

export interface BannerConfig {
  subtitle: TextConfig;
  title: TextConfig;
  dateLocation: TextConfig;
  background: BackgroundConfig;
}

// Default values based on user's final settings (converted from pixels to Three.js units)
// User provided: subtitle fontSize: 78, title fontSize: 228, dateLocation fontSize: 87
// Divide by unitToPixel (600) to get Three.js units
export const DEFAULT_BANNER_CONFIG: BannerConfig = {
  subtitle: {
    fontSize: 78 / unitToPixel, // 0.13
    color: "#ffffff",
    letterSpacing: 48 / unitToPixel, // 0.08
    text: "{Tech: Europe}",
    position: { x: 0, y: 216 / unitToPixel }, // 0.36
  },
  title: {
    fontSize: 228 / unitToPixel, // 0.38
    color: "#ffffff",
    letterSpacing: -12 / unitToPixel, // -0.02
    text: "Applied AI Conf",
    position: { x: 0, y: -12 / unitToPixel }, // -0.02
  },
  dateLocation: {
    fontSize: 87 / unitToPixel, // 0.145
    color: "#ffffff",
    letterSpacing: 18 / unitToPixel, // 0.03
    text: "May 28, 2026 · Berlin",
    position: { x: 0, y: -240 / unitToPixel }, // -0.4
  },
  background: {
    fogDensity: 2,
    gridOpacity: 0.55,
    animationPaused: true,
    animationTime: 57.5,
  },
};

interface HistoryState {
  past: BannerConfig[];
  future: BannerConfig[];
}

interface BannerStore {
  config: BannerConfig;
  history: HistoryState;
  selectedElement: "subtitle" | "title" | "dateLocation" | null;

  // Actions
  setConfig: (config: Partial<BannerConfig>) => void;
  setSubtitle: (subtitle: Partial<TextConfig>) => void;
  setTitle: (title: Partial<TextConfig>) => void;
  setDateLocation: (dateLocation: Partial<TextConfig>) => void;
  setBackground: (background: Partial<BackgroundConfig>) => void;
  setSelectedElement: (
    element: "subtitle" | "title" | "dateLocation" | null
  ) => void;
  resetConfig: () => void;
  undo: () => void;
  redo: () => void;
}

const pushHistory = (
  history: HistoryState,
  currentConfig: BannerConfig
): HistoryState => ({
  past: [...history.past, currentConfig].slice(-50), // Keep last 50 states
  future: [],
});

export const useBannerStore = create<BannerStore>((set, get) => ({
  config: DEFAULT_BANNER_CONFIG,
  history: { past: [], future: [] },
  selectedElement: null,

  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
      history: pushHistory(state.history, state.config),
    })),

  setSubtitle: (subtitle) =>
    set((state) => ({
      config: {
        ...state.config,
        subtitle: { ...state.config.subtitle, ...subtitle },
      },
      history: pushHistory(state.history, state.config),
    })),

  setTitle: (title) =>
    set((state) => ({
      config: {
        ...state.config,
        title: { ...state.config.title, ...title },
      },
      history: pushHistory(state.history, state.config),
    })),

  setDateLocation: (dateLocation) =>
    set((state) => ({
      config: {
        ...state.config,
        dateLocation: { ...state.config.dateLocation, ...dateLocation },
      },
      history: pushHistory(state.history, state.config),
    })),

  setBackground: (background) =>
    set((state) => ({
      config: {
        ...state.config,
        background: { ...state.config.background, ...background },
      },
      history: pushHistory(state.history, state.config),
    })),

  setSelectedElement: (element) => set({ selectedElement: element }),

  resetConfig: () =>
    set((state) => ({
      config: DEFAULT_BANNER_CONFIG,
      history: pushHistory(state.history, state.config),
    })),

  undo: () =>
    set((state) => {
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        config: previous,
        history: {
          past: newPast,
          future: [state.config, ...state.history.future],
        },
      };
    }),

  redo: () =>
    set((state) => {
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        config: next,
        history: {
          past: [...state.history.past, state.config],
          future: newFuture,
        },
      };
    }),
}));

