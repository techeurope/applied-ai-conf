export interface AudienceSegment {
  label: string;
  percentage: string;
}

export interface PartnershipTier {
  name: string;
  price: string;
  description: string;
  includes: string[];
  limit?: string;
}

export interface PartnershipAddOn {
  name: string;
  description: string;
  price: string;
}

export interface PartnershipOverview {
  about: string[];
  participants: string;
  focusAreas: string[];
  audience: AudienceSegment[];
  tiers: PartnershipTier[];
  addOns: PartnershipAddOn[];
}
