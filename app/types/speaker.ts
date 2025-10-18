export interface Speaker {
  name: string;
  title: string;
  company: string;
  bio: string;
  initial: string;
  accent: string;
  socials?: {
    label: string;
    url: string;
  }[];
}
