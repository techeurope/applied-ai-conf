import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PreviewMode = "fixed" | "auto";

// Asset configuration types
export interface TextStyle {
  fontSize: number;
  color: string;
  letterSpacing: number;
}

export interface ImageStyle {
  size: number;
  positionY: number;
}

export interface BackgroundStyle {
  overlayOpacity: number;
  gridColor: string;
}

export interface AssetConfig {
  // Image
  image: ImageStyle;
  // Speaker name
  name: TextStyle;
  // Title & Company
  subtitle: TextStyle;
  // Conference branding
  branding: TextStyle & { text: string };
  // Date & Location
  dateLocation: TextStyle & { text: string };
  // Background
  background: BackgroundStyle;
}

// Default configuration
export const DEFAULT_ASSET_CONFIG: AssetConfig = {
  image: {
    size: 2,
    positionY: 0.5,
  },
  name: {
    fontSize: 0.22,
    color: "#ffffff",
    letterSpacing: 0.02,
  },
  subtitle: {
    fontSize: 0.12,
    color: "#999999",
    letterSpacing: 0,
  },
  branding: {
    fontSize: 0.1,
    color: "#ab7030",
    letterSpacing: 0.05,
    text: "APPLIED AI CONF",
  },
  dateLocation: {
    fontSize: 0.08,
    color: "#666666",
    letterSpacing: 0,
    text: "May 28, 2026 · Berlin",
  },
  background: {
    overlayOpacity: 0.4,
    gridColor: "#ab7030",
  },
};

interface SpeakerAssetStore {
  // Preview mode
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  
  // Asset configuration
  config: AssetConfig;
  updateConfig: <K extends keyof AssetConfig>(
    key: K,
    value: Partial<AssetConfig[K]>
  ) => void;
  resetConfig: () => void;
  
  // Controls panel visibility
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

export const useSpeakerAssetStore = create<SpeakerAssetStore>()(
  persist(
    (set) => ({
      // Preview mode
      previewMode: "fixed",
      setPreviewMode: (mode) => set({ previewMode: mode }),
      
      // Asset configuration
      config: DEFAULT_ASSET_CONFIG,
      updateConfig: (key, value) =>
        set((state) => ({
          config: {
            ...state.config,
            [key]: { ...state.config[key], ...value },
          },
        })),
      resetConfig: () => set({ config: DEFAULT_ASSET_CONFIG }),
      
      // Controls panel
      showAdvanced: false,
      setShowAdvanced: (show) => set({ showAdvanced: show }),
    }),
    {
      name: "speaker-asset-preferences",
    }
  )
);
