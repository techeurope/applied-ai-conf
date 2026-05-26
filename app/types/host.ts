export interface Host {
  name: string;
  role: string;
  stage: 'main' | 'side';
  company?: string;
  companyUrl?: string;
  linkedinUrl?: string;
  image: string;
  imageTransparent: string;
  imageAlt: string;
}
