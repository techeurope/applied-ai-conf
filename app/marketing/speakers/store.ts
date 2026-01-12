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

export type SelectableElementType = Exclude<ElementType, null>;

// Position for draggable elements
export interface Position {
  x: number;
  y: number;
}

export type HorizontalAlign = "left" | "center" | "right";

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
  align: HorizontalAlign;
}

export interface BackgroundStyle {
  enabled: boolean; // Whether to show the lidar grid background
  solidColor: string; // Solid background color when grid is disabled
  overlayOpacity: number;
  gridColor: string;
  animationPaused: boolean;
  animationTime: number; // Fixed time when paused (0-100 range for UI, maps to shader time)
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
  // Global text color override (when set, applies to all text elements)
  globalTextColor: string | null;
}

const HISTORY_LIMIT = 100;
const cloneConfig = (config: AssetConfig): AssetConfig => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = (globalThis as any).structuredClone as undefined | ((v: any) => any);
  if (typeof sc === "function") return sc(config);
  return JSON.parse(JSON.stringify(config)) as AssetConfig;
};

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
    align: "center",
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
    enabled: true,
    solidColor: "#05070f",
    overlayOpacity: 0.4,
    gridColor: "#ab7030",
    animationPaused: false,
    animationTime: 0,
  },
  globalTextColor: null,
};

// Get default value for a specific element
export function getDefaultForElement<K extends keyof AssetConfig>(
  key: K
): AssetConfig[K] {
  return DEFAULT_ASSET_CONFIG[key];
}

export interface SpeakerAssetStore {
  // Preview mode
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;

  // Selection
  selectedElement: ElementType; // active element (backwards-compatible)
  selectedElements: SelectableElementType[];
  setSelectedElement: (element: ElementType) => void; // selects single (or clears)
  toggleSelectedElement: (element: SelectableElementType) => void;
  addSelectedElement: (element: SelectableElementType) => void;
  clearSelection: () => void;

  // Asset configuration
  config: AssetConfig;
  historyPast: AssetConfig[];
  historyFuture: AssetConfig[];
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  updateConfig: <K extends keyof AssetConfig>(
    key: K,
    value: Partial<AssetConfig[K]>
  ) => void;
  updatePosition: (element: keyof AssetConfig, position: Partial<Position>) => void;
  setPositions: (positions: Partial<Record<keyof AssetConfig, Position>>) => void;
  setPositionsNoHistory: (positions: Partial<Record<keyof AssetConfig, Position>>) => void;
  alignSelectedToActive: (axis: "x" | "y") => void;
  resetConfig: () => void;
  resetElement: (element: keyof AssetConfig) => void;
  setGlobalTextColor: (color: string | null) => void;

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
      align: (storedConfig.logo as Partial<LogoStyle>).align || DEFAULT_ASSET_CONFIG.logo.align,
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
      // Ensure all props exist
      enabled: (storedConfig.background as Partial<BackgroundStyle>).enabled ?? DEFAULT_ASSET_CONFIG.background.enabled,
      solidColor: (storedConfig.background as Partial<BackgroundStyle>).solidColor ?? DEFAULT_ASSET_CONFIG.background.solidColor,
      animationPaused: (storedConfig.background as Partial<BackgroundStyle>).animationPaused ?? DEFAULT_ASSET_CONFIG.background.animationPaused,
      animationTime: (storedConfig.background as Partial<BackgroundStyle>).animationTime ?? DEFAULT_ASSET_CONFIG.background.animationTime,
    };
  }

  // Ensure globalTextColor exists
  config.globalTextColor = storedConfig.globalTextColor ?? DEFAULT_ASSET_CONFIG.globalTextColor;

  return config;
}

export const useSpeakerAssetStore = create<SpeakerAssetStore>()(
  // @ts-expect-error - persist middleware has complex type inference issues with partialize
  persist(
    (set: any) => ({
      // Preview mode
      previewMode: "fixed",
      setPreviewMode: (mode: PreviewMode) => set({ previewMode: mode }),

      // Selection
      selectedElement: null,
      selectedElements: [],
      setSelectedElement: (element: ElementType) =>
        set(() => ({
          selectedElement: element,
          selectedElements: element ? [element] : [],
        })),
      toggleSelectedElement: (element: SelectableElementType) =>
        set((state: SpeakerAssetStore) => {
          const exists = state.selectedElements.includes(element);
          const next = exists
            ? state.selectedElements.filter((e) => e !== element)
            : [...state.selectedElements, element];
          return {
            selectedElements: next,
            selectedElement: next.length ? next[next.length - 1] : null,
          };
        }),
      addSelectedElement: (element: SelectableElementType) =>
        set((state: SpeakerAssetStore) => {
          const exists = state.selectedElements.includes(element);
          const next = exists ? state.selectedElements : [...state.selectedElements, element];
          return {
            selectedElements: next,
            selectedElement: element,
          };
        }),
      clearSelection: () => set({ selectedElement: null, selectedElements: [] }),

      // Asset configuration
      config: DEFAULT_ASSET_CONFIG,
      historyPast: [],
      historyFuture: [],
      canUndo: () => useSpeakerAssetStore.getState().historyPast.length > 0,
      canRedo: () => useSpeakerAssetStore.getState().historyFuture.length > 0,
      pushHistory: () =>
        set((state: SpeakerAssetStore) => ({
          historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
            -HISTORY_LIMIT
          ),
          historyFuture: [],
        })),
      undo: () =>
        set((state: SpeakerAssetStore) => {
          if (state.historyPast.length === 0) return state;
          const previous = state.historyPast[state.historyPast.length - 1];
          return {
            config: previous,
            historyPast: state.historyPast.slice(0, -1),
            historyFuture: [cloneConfig(state.config), ...state.historyFuture].slice(
              0,
              HISTORY_LIMIT
            ),
          };
        }),
      redo: () =>
        set((state: SpeakerAssetStore) => {
          if (state.historyFuture.length === 0) return state;
          const next = state.historyFuture[0];
          return {
            config: next,
            historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
              -HISTORY_LIMIT
            ),
            historyFuture: state.historyFuture.slice(1),
          };
        }),
      updateConfig: <K extends keyof AssetConfig>(key: K, value: Partial<AssetConfig[K]>) =>
        set((state: SpeakerAssetStore) => {
          // Handle primitive values (like globalTextColor which is string | null)
          const currentValue = state.config[key];
          const newValue = typeof currentValue === 'object' && currentValue !== null
            ? { ...currentValue, ...value }
            : value;
          return {
            historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
              -HISTORY_LIMIT
            ),
            historyFuture: [],
            config: {
              ...state.config,
              [key]: newValue,
            },
          };
        }),
      updatePosition: (element: keyof AssetConfig, position: Partial<Position>) =>
        set((state: SpeakerAssetStore) => {
          const elementConfig = state.config[element];
          if (elementConfig && typeof elementConfig === 'object' && "position" in elementConfig) {
            return {
              historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
                -HISTORY_LIMIT
              ),
              historyFuture: [],
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
      setPositions: (positions: Partial<Record<keyof AssetConfig, Position>>) =>
        set((state: SpeakerAssetStore) => {
          const nextConfig: AssetConfig = { ...state.config };
          (Object.keys(positions) as Array<keyof AssetConfig>).forEach((key) => {
            const pos = positions[key];
            if (!pos) return;
            const current = nextConfig[key];
            if (current && typeof current === "object" && "position" in current) {
              (nextConfig as any)[key] = {
                ...(current as any),
                position: pos,
              };
            }
          });
          return {
            historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
              -HISTORY_LIMIT
            ),
            historyFuture: [],
            config: nextConfig,
          };
        }),
      setPositionsNoHistory: (positions: Partial<Record<keyof AssetConfig, Position>>) =>
        set((state: SpeakerAssetStore) => {
          const nextConfig: AssetConfig = { ...state.config };
          (Object.keys(positions) as Array<keyof AssetConfig>).forEach((key) => {
            const pos = positions[key];
            if (!pos) return;
            const current = nextConfig[key];
            if (current && typeof current === "object" && "position" in current) {
              (nextConfig as any)[key] = {
                ...(current as any),
                position: pos,
              };
            }
          });
          return { config: nextConfig };
        }),
      alignSelectedToActive: (axis: "x" | "y") =>
        set((state: SpeakerAssetStore) => {
          const active = state.selectedElement;
          if (!active) return state;

          const activeConfig = state.config[active as keyof AssetConfig] as any;
          const activePos: Position | undefined =
            activeConfig && typeof activeConfig === "object" && "position" in activeConfig
              ? activeConfig.position
              : undefined;
          if (!activePos) return state;

          const nextConfig: AssetConfig = { ...state.config };
          state.selectedElements.forEach((el) => {
            const cfg = nextConfig[el as keyof AssetConfig] as any;
            if (!cfg || typeof cfg !== "object" || !("position" in cfg)) return;
            const currentPos = cfg.position as Position;
            const nextPos: Position =
              axis === "x"
                ? { x: activePos.x, y: currentPos.y }
                : { x: currentPos.x, y: activePos.y };
            (nextConfig as any)[el] = { ...cfg, position: nextPos };
          });
          return {
            historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
              -HISTORY_LIMIT
            ),
            historyFuture: [],
            config: nextConfig,
          };
        }),
      resetConfig: () =>
        set((state: SpeakerAssetStore) => ({
          historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
            -HISTORY_LIMIT
          ),
          historyFuture: [],
          config: DEFAULT_ASSET_CONFIG,
        })),
      resetElement: (element: keyof AssetConfig) =>
        set((state: SpeakerAssetStore) => ({
          historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
            -HISTORY_LIMIT
          ),
          historyFuture: [],
          config: {
            ...state.config,
            [element]: DEFAULT_ASSET_CONFIG[element],
          },
        })),
      setGlobalTextColor: (color: string | null) =>
        set((state: SpeakerAssetStore) => ({
          historyPast: [...state.historyPast, cloneConfig(state.config)].slice(
            -HISTORY_LIMIT
          ),
          historyFuture: [],
          config: {
            ...state.config,
            globalTextColor: color,
          },
        })),

      // Controls panel
      showAdvanced: false,
      setShowAdvanced: (show: boolean) => set({ showAdvanced: show }),
    }),
    {
      name: "speaker-asset-preferences",
      version: 5, // Increment version to trigger migration
      migrate: (persistedState: any, version: number) => {
        if (version < 5) {
          // Migrate persisted config to current shape (positions, logo align, animation props)
          const state = persistedState as { config?: Partial<AssetConfig> };
          return {
            ...(persistedState as object),
            selectedElement: null,
            selectedElements: [],
            config: state.config ? migrateConfig(state.config) : DEFAULT_ASSET_CONFIG,
          } as unknown;
        }
        return persistedState;
      },
      // Only persist the meaningful settings, not transient UI selection state.
      partialize: (state) => ({
        previewMode: state.previewMode,
        config: state.config,
      }),
    }
  )
);
