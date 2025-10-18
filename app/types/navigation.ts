export interface NavigationLink {
  label: string;
  href: string;
}

export type NavigationActionVariant = 'primary' | 'secondary';

export interface NavigationAction {
  label: string;
  href: string;
  variant: NavigationActionVariant;
}

export interface FooterLink {
  label: string;
  href: string;
}
