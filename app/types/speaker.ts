export interface Speaker {
  name: string;
  title: string;
  company: string;
  companyLogo?: string;
  bio: string;
  initial: string;
  accent: string;
  image?: string;
  socials?: {
    label: string;
    url: string;
  }[];
}
