export interface Speaker {
  name: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyUrl?: string;
  linkedinUrl?: string;
  bio: string;
  vertical: string; // Industry vertical (e.g., "Legal", "Enterprise", "Education")
  building: string; // What they're building (short description)
  initial: string;
  accent: string;
  talkTitle?: string; // Talk title (undefined = TBA)
  hidden?: boolean; // Speaker not yet confirmed — hide from website
  image?: string; // Original image (with background)
  imageTransparent?: string; // Transparent PNG (background removed via remove-background.mjs)
  imageAlt: string; // Alt text for headshot
  logoAlt?: string; // Alt text for company logo
  nameFontSize?: number; // Override marketing card name size in px (default 140) for long names
  titleFontSize?: number; // Override marketing card title size in px (default 48) for long titles
  socials?: {
    label: string;
    url: string;
  }[];
}
