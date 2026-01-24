import { create } from "zustand";

export type PreviewMode = "fixed" | "auto";

// All selectable element types
export type ElementType =
  | "image"
  | "speakerName"
  | "speakerRole"
  | "speakerCompany"
  | "speakerMetaCard" // legacy, kept for compatibility
  | "companyLogo"
  | "techEurope"
  | "logo"
  | "dateLocation"
  | "background"
  | null;

export type SelectableElementType = Exclude<ElementType, null>;

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

export interface LogoImageStyle {
  scale: number;
  opacity: number;
  position: Position;
}

export interface MetaCardStyle {
  enabled: boolean;
  width: number;
  height: number;
  position: Position;
  backgroundColor: string;
  backgroundOpacity: number;
  borderColor: string;
  borderOpacity: number;
  labelColor: string;
  labelSize: number;
  labelTracking: number;
  valueColor: string;
  valueSize: number;
  valueTracking: number;
  logoScale: number;
  logoOpacity: number;
}

export interface RoleStyle {
  position: Position;
  labelColor: string;
  labelSize: number;
  labelTracking: number;
  valueColor: string;
  valueSize: number;
  valueTracking: number;
  showLabel: boolean;
}

export interface CompanyStyle {
  position: Position;
  labelColor: string;
  labelSize: number;
  labelTracking: number;
  logoScale: number;
  logoOpacity: number;
  showLabel: boolean;
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
  // Speaker name (large, prominent)
  speakerName: TextStyle;
  // Speaker title (e.g. "CTO @") next to company logo
  speakerTitle: TextStyle;
  // Speaker role (separate, movable)
  speakerRole: RoleStyle;
  // Speaker company (separate, movable)
  speakerCompany: CompanyStyle;
  // Speaker meta card (role + company) - legacy, kept for combined mode
  speakerMetaCard: MetaCardStyle;
  // Company logo (image)
  companyLogo: LogoImageStyle;
  // {Tech: Europe} text above logo
  techEurope: TextStyle & { text: string };
  // Conference logo (text-based: "APPLIED" / "AI CONF")
  logo: TextStyle & { textLine1: string; textLine2: string };
  // Date & Location (e.g. "MAY 28TH | BERLIN")
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

// Default configuration - user configured layout
export const DEFAULT_ASSET_CONFIG: AssetConfig = {
  image: {
    size: 3,
    position: { x: 0.8436550366900559, y: -0.5786803602393744 },
  },
  speakerName: {
    fontSize: 0.38,
    color: "#ffffff",
    letterSpacing: -0.01,
    position: { x: -1.6710664042674415, y: 1.2497467645068157 },
  },
  speakerTitle: {
    fontSize: 0.1,
    color: "#ffffff",
    letterSpacing: 0.02,
    position: { x: -1.95, y: 0.65 },
  },
  speakerRole: {
    position: { x: -1.95, y: 0.75 },
    labelColor: "#6b7280",
    labelSize: 0.07,
    labelTracking: 0.08,
    valueColor: "#ffffff",
    valueSize: 0.1,
    valueTracking: 0.02,
    showLabel: true,
  },
  speakerCompany: {
    position: { x: -1.95, y: 0.35 },
    labelColor: "#6b7280",
    labelSize: 0.07,
    labelTracking: 0.08,
    logoScale: 0.16,
    logoOpacity: 0.9,
    showLabel: true,
  },
  speakerMetaCard: {
    enabled: false, // disabled by default, use separate role/company
    width: 1.7,
    height: 0.85,
    position: { x: -1.35, y: 0.55 },
    backgroundColor: "#0a0d18",
    backgroundOpacity: 0,
    borderColor: "#ffffff",
    borderOpacity: 0.12,
    labelColor: "#6b7280",
    labelSize: 0.07,
    labelTracking: 0.08,
    valueColor: "#ffffff",
    valueSize: 0.1,
    valueTracking: 0.02,
    logoScale: 0.16,
    logoOpacity: 0.9,
  },
  companyLogo: {
    scale: 0.4,
    opacity: 0.6,
    position: { x: -1.65, y: 0.65 },
  },
  techEurope: {
    fontSize: 0.11,
    color: "#ffffff",
    letterSpacing: 0.02,
    text: "{Tech: Europe}",
    position: { x: -1.98, y: -0.85 },
  },
  logo: {
    fontSize: 0.24,
    color: "#ffffff",
    letterSpacing: 0.06,
    textLine1: "APPLIED",
    textLine2: "AI CONF",
    position: { x: -1.35, y: -1.3 },
  },
  dateLocation: {
    fontSize: 0.11,
    color: "#666666",
    letterSpacing: 0,
    text: "MAY 28TH | BERLIN",
    position: { x: -1.9309651100701677, y: -1.8180205403590615 },
  },
  background: {
    enabled: false,
    solidColor: "#000000",
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
  setElementCenterOffset: (element: SelectableElementType, offset: Position) => void;
  elementCenterOffsets: Partial<Record<SelectableElementType, Position>>;

  // Controls panel visibility
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

// Migrate old config format to new format with positions
// Version 6 introduces new layout: companyName, speakerIntro, weekday (replacing name, subtitle)
function migrateConfig(storedConfig: Partial<AssetConfig>): AssetConfig {
  // For version 6+, just return defaults - the layout changed significantly
  // Old persisted data won't make sense with the new layout
  return DEFAULT_ASSET_CONFIG;
}

const storeCreator = (set: (partial: Partial<SpeakerAssetStore> | ((state: SpeakerAssetStore) => Partial<SpeakerAssetStore>)) => void): SpeakerAssetStore => ({
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

          const activeOffset = state.elementCenterOffsets[active] ?? { x: 0, y: 0 };
          const activeCenter: Position = {
            x: activePos.x + activeOffset.x,
            y: activePos.y + activeOffset.y,
          };

          const nextConfig: AssetConfig = { ...state.config };
          state.selectedElements.forEach((el) => {
            const cfg = nextConfig[el as keyof AssetConfig] as any;
            if (!cfg || typeof cfg !== "object" || !("position" in cfg)) return;
            const currentPos = cfg.position as Position;
            const offset = state.elementCenterOffsets[el] ?? { x: 0, y: 0 };
            const nextPos: Position =
              axis === "x"
                ? { x: activeCenter.x - offset.x, y: currentPos.y }
                : { x: currentPos.x, y: activeCenter.y - offset.y };
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
      setElementCenterOffset: (element: SelectableElementType, offset: Position) =>
        set((state: SpeakerAssetStore) => ({
          elementCenterOffsets: {
            ...state.elementCenterOffsets,
            [element]: offset,
          },
        })),
      elementCenterOffsets: {},

      // Controls panel
      showAdvanced: false,
      setShowAdvanced: (show: boolean) => set({ showAdvanced: show }),
});

export const useSpeakerAssetStore = create<SpeakerAssetStore>()(storeCreator);
