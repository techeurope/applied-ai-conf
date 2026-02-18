export type PartnerTier = 'gold' | 'community';

export interface Partner {
  name: string;
  logo: string;
  url: string;
  logoAlt: string;
  /** CSS scale factor to visually match logo sizes (default 1) */
  logoScale?: number;
}

export interface PartnersByTier {
  gold: Partner[];
  community: Partner[];
}
