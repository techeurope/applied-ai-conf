import type {
  PartnershipOverview,
  PartnershipAddOn,
  PartnershipTier,
  AudienceSegment,
} from "@/types";

const AUDIENCE_SNAPSHOT = [
  { label: "Applied AI founders & engineers", percentage: "60%" },
  { label: "Infrastructure & developer companies", percentage: "25%" },
  { label: "Investors & ecosystem partners", percentage: "10%" },
  { label: "Press & researchers", percentage: "5%" },
] satisfies AudienceSegment[];

const PARTNERSHIP_TIERS = [
  {
    name: "Platinum Partner",
    price: "€60,000",
    description:
      "For global infrastructure and developer platforms seeking headline visibility.",
    limit: "Max. 2 partners",
    includes: [
      "Premium entrance-level booth (6 × 6 m)",
      "Main-stage keynote or panel participation",
      "Logo featured on signage, agenda, and website",
      "Integration in recap video and media content",
      "10 full-access passes",
    ],
  },
  {
    name: "Gold Partner",
    price: "€25,000",
    description:
      "For companies seeking both thought leadership and product exposure.",
    includes: [
      "45-minute workshop slot",
      "Large expo booth",
      "Logo on website and program signage",
      "6 event passes",
    ],
  },
  {
    name: "Silver Partner",
    price: "€12,000",
    description:
      "For companies focused on strong visibility and product exposure.",
    includes: [
      "Medium expo booth",
      "30-minute workshop slot",
      "Logo on website and partner wall",
      "4 event passes",
    ],
  },
  {
    name: "Bronze Partner",
    price: "€5,000",
    description: "For early-stage startups and ecosystem partners.",
    includes: ["Logo on website and partner wall", "2 event passes"],
  },
] satisfies PartnershipTier[];

const PARTNERSHIP_ADD_ONS = [
  {
    name: "Lanyard Sponsor",
    description: "Branding on all attendee badges",
    price: "€10,000",
  },
  {
    name: "Coffee Bar Sponsor",
    description: "Branded coffee or networking area",
    price: "€10,000",
  },
  {
    name: "Co-Working Lounge",
    description: "Working & networking area",
    price: "€10,000",
  },
  {
    name: "Evening Drinks Sponsor",
    description: "Co-branded closing reception",
    price: "€10,000",
  },
] satisfies PartnershipAddOn[];

export const PARTNERSHIP_OVERVIEW = {
  about: [
    "Applied AI Conf by {Tech: Europe} is a one-day gathering for founders, engineers & builders using ai daily on scale in europe",
    "We're bringing together a curated, in-person audience for a day of technical talks, panels, and demos spanning GPU orchestration, model evaluation, and applied AI in production.",
  ],
  participants: "Curated in-person audience",
  focusAreas: [
    "GPU orchestration",
    "Model evaluation",
    "Applied AI in production",
  ],
  audience: AUDIENCE_SNAPSHOT,
  tiers: PARTNERSHIP_TIERS,
  addOns: PARTNERSHIP_ADD_ONS,
} satisfies PartnershipOverview;
