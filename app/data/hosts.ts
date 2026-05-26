import type { Host } from '@/types';

export const HOSTS: Host[] = [
  {
    name: 'David Asabina',
    role: 'Engineer & Interim CTO',
    stage: 'main',
    company: 'Asabina',
    companyUrl: 'https://asabina.de',
    linkedinUrl: 'https://www.linkedin.com/in/davidasabina/',
    image: '/hosts/david_asabina_fullbody_square.png',
    imageTransparent: '/hosts/david_asabina_fullbody_transparent_square.png',
    imageAlt: 'David Asabina headshot',
  },
];

export const MAIN_STAGE_HOST = HOSTS.find((h) => h.stage === 'main');
export const SIDE_STAGE_HOST = HOSTS.find((h) => h.stage === 'side');
