export type PartnerTier = 'premium' | 'gold' | 'community';

export interface Partner {
  name: string;
  logo: string;
  url: string;
  logoAlt: string;
  /** CSS scale factor to visually match logo sizes (default 1) */
  logoScale?: number;
}

export interface PartnersByTier {
  premium: Partner[];
  gold: Partner[];
  community: Partner[];
}
