import type { Host } from '@/types';

export const HOSTS: Host[] = [
  {
    name: 'David Asabina',
    role: 'Freelance engineer & tech due diligence advisor for investors and founders',
    stage: 'main',
    company: 'Asabina',
    companyUrl: 'https://asabina.de',
    linkedinUrl: 'https://www.linkedin.com/in/vidbina/',
    image: '/hosts/david_asabina_fullbody_square.png',
    imageTransparent: '/hosts/david_asabina_fullbody_transparent_square.png',
    imageAlt: 'David Asabina headshot',
  },
];

export const MAIN_STAGE_HOST = HOSTS.find((h) => h.stage === 'main');
export const SIDE_STAGE_HOST = HOSTS.find((h) => h.stage === 'side');
