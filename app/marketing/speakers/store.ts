import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PreviewMode = "fixed" | "auto";

// All selectable element types
export type ElementType =
  | "image"
  | "name"
  | "subtitle"
  | "logo"
  | "branding"
  | "dateLocation"
  | "background"
  | null;

// Position for draggable elements
export interface Position {
  x: number;
  y: number;
}

// Asset configuration types
export interface TextStyle {
  fontSize: number;
  color: string;
  letterSpacing: number;
  position: Position;
}

export interface ImageStyle {
  size: number;
  position: Position;
}

export interface LogoStyle {
  scale: number;
  opacity: number;
  position: Position;
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
  // Title (subtitle)
  subtitle: TextStyle;
  // Company logo
  logo: LogoStyle;
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
    position: { x: 0, y: 0.5 },
  },
  name: {
    fontSize: 0.22,
    color: "#ffffff",
    letterSpacing: 0.02,
    position: { x: 0, y: -0.9 },
  },
  subtitle: {
    fontSize: 0.12,
    color: "#999999",
    letterSpacing: 0,
    position: { x: 0, y: -1.18 },
  },
  logo: {
    scale: 0.12,
    opacity: 0.8,
    position: { x: 0, y: -1.38 },
  },
  branding: {
    fontSize: 0.1,
    color: "#ab7030",
    letterSpacing: 0.05,
    text: "APPLIED AI CONF",
    position: { x: 0, y: -1.62 },
  },
  dateLocation: {
    fontSize: 0.08,
    color: "#666666",
    letterSpacing: 0,
    text: "May 28, 2026 · Berlin",
    position: { x: 0, y: -1.78 },
  },
  background: {
    overlayOpacity: 0.4,
    gridColor: "#ab7030",
  },
};

// Get default value for a specific element
export function getDefaultForElement<K extends keyof AssetConfig>(
  key: K
): AssetConfig[K] {
  return DEFAULT_ASSET_CONFIG[key];
}

interface SpeakerAssetStore {
  // Preview mode
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;

  // Selected element
  selectedElement: ElementType;
  setSelectedElement: (element: ElementType) => void;

  // Asset configuration
  config: AssetConfig;
  updateConfig: <K extends keyof AssetConfig>(
    key: K,
    value: Partial<AssetConfig[K]>
  ) => void;
  updatePosition: (element: keyof AssetConfig, position: Partial<Position>) => void;
  resetConfig: () => void;
  resetElement: (element: keyof AssetConfig) => void;

  // Controls panel visibility
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

// Migrate old config format to new format with positions
function migrateConfig(storedConfig: Partial<AssetConfig>): AssetConfig {
  const config = { ...DEFAULT_ASSET_CONFIG };

  // Migrate each element, preserving old values and adding new defaults
  if (storedConfig.image) {
    config.image = {
      ...DEFAULT_ASSET_CONFIG.image,
      ...storedConfig.image,
      position: storedConfig.image.position || DEFAULT_ASSET_CONFIG.image.position,
    };
    // Handle old positionY format
    if ('positionY' in storedConfig.image && !storedConfig.image.position) {
      config.image.position = {
        x: 0,
        y: (storedConfig.image as { positionY?: number }).positionY || DEFAULT_ASSET_CONFIG.image.position.y,
      };
    }
  }

  if (storedConfig.name) {
    config.name = {
      ...DEFAULT_ASSET_CONFIG.name,
      ...storedConfig.name,
      position: storedConfig.name.position || DEFAULT_ASSET_CONFIG.name.position,
    };
  }

  if (storedConfig.subtitle) {
    config.subtitle = {
      ...DEFAULT_ASSET_CONFIG.subtitle,
      ...storedConfig.subtitle,
      position: storedConfig.subtitle.position || DEFAULT_ASSET_CONFIG.subtitle.position,
    };
  }

  if (storedConfig.logo) {
    config.logo = {
      ...DEFAULT_ASSET_CONFIG.logo,
      ...storedConfig.logo,
      position: storedConfig.logo.position || DEFAULT_ASSET_CONFIG.logo.position,
    };
  }

  if (storedConfig.branding) {
    config.branding = {
      ...DEFAULT_ASSET_CONFIG.branding,
      ...storedConfig.branding,
      position: storedConfig.branding.position || DEFAULT_ASSET_CONFIG.branding.position,
    };
  }

  if (storedConfig.dateLocation) {
    config.dateLocation = {
      ...DEFAULT_ASSET_CONFIG.dateLocation,
      ...storedConfig.dateLocation,
      position: storedConfig.dateLocation.position || DEFAULT_ASSET_CONFIG.dateLocation.position,
    };
  }

  if (storedConfig.background) {
    config.background = {
      ...DEFAULT_ASSET_CONFIG.background,
      ...storedConfig.background,
    };
  }

  return config;
}

export const useSpeakerAssetStore = create<SpeakerAssetStore>()(
  persist(
    (set) => ({
      // Preview mode
      previewMode: "fixed",
      setPreviewMode: (mode) => set({ previewMode: mode }),

      // Selected element
      selectedElement: null,
      setSelectedElement: (element) => set({ selectedElement: element }),

      // Asset configuration
      config: DEFAULT_ASSET_CONFIG,
      updateConfig: (key, value) =>
        set((state) => ({
          config: {
            ...state.config,
            [key]: { ...state.config[key], ...value },
          },
        })),
      updatePosition: (element, position) =>
        set((state) => {
          const elementConfig = state.config[element];
          if ("position" in elementConfig) {
            return {
              config: {
                ...state.config,
                [element]: {
                  ...elementConfig,
                  position: { ...elementConfig.position, ...position },
                },
              },
            };
          }
          return state;
        }),
      resetConfig: () => set({ config: DEFAULT_ASSET_CONFIG }),
      resetElement: (element) =>
        set((state) => ({
          config: {
            ...state.config,
            [element]: DEFAULT_ASSET_CONFIG[element],
          },
        })),

      // Controls panel
      showAdvanced: false,
      setShowAdvanced: (show) => set({ showAdvanced: show }),
    }),
    {
      name: "speaker-asset-preferences",
      version: 2, // Increment version to trigger migration
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Migrate from old config format
          const state = persistedState as { config?: Partial<AssetConfig> };
          return {
            ...persistedState,
            config: state.config ? migrateConfig(state.config) : DEFAULT_ASSET_CONFIG,
          };
        }
        return persistedState;
      },
    }
  )
);
