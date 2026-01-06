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
  image?: string;
  imageAlt: string; // Alt text for headshot
  logoAlt?: string; // Alt text for company logo
  socials?: {
    label: string;
    url: string;
  }[];
}
