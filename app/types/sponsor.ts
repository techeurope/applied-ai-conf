export type SponsorTier = 'diamond' | 'platinum' | 'gold';

export interface SponsorGroup {
  tier: SponsorTier;
  members: string[];
}

export interface SponsorsByTier {
  diamond: string[];
  platinum: string[];
  gold: string[];
}
