// Config for the 2027 "thank you 2026 + partner CTA" homepage.

// 2027 partner application form.
export const PARTNER_2027_FORM_URL = "https://forms.techeurope.io/aac/partner";

// Photographer credit for the 2026 photos.
export const PHOTO_CREDIT = {
  name: "Max Iwert",
  website: "https://www.iwert.de",
  fullGallery: "https://www.picdrop.com/maxiwert/a4WnF73wFR",
};

// Build a deep link to a single photo's detail page in the picdrop gallery.
export const photoDetailUrl = (key: string) =>
  `${PHOTO_CREDIT.fullGallery}?file=${key}`;

export interface GalleryPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  // picdrop file key — used to deep link to the photo's detail page.
  key: string;
}

// 2026 photos by Max Iwert (see PHOTO_CREDIT). Mixed landscape/portrait, rendered
// as a masonry. Order is interleaved so the columns stay visually balanced.
export const GALLERY_2026: GalleryPhoto[] = [
  { src: "/2026/celebration.jpg", alt: "Celebrating at Applied AI Conf 2026", width: 1600, height: 1067, key: "0ba9856fd5427784450108dd1d266b1b" },
  { src: "/2026/booth.jpg", alt: "The Nebius booth at Applied AI Conf 2026", width: 1280, height: 854, key: "bc2a551e140330c858b449b953992b0e" },
  { src: "/2026/attendees.jpg", alt: "Partners at the Nebius booth at Applied AI Conf 2026", width: 854, height: 1280, key: "2f2f6fe7e31318795c1e3e2cdd9ee235" },
  { src: "/2026/expo.jpg", alt: "The partner booths at Applied AI Conf 2026", width: 1280, height: 853, key: "fe62478049014ebf2d3d58a5f050998c" },
  { src: "/2026/keynote.jpg", alt: "On stage at Applied AI Conf 2026", width: 1280, height: 854, key: "c083e7dd6fcff2bfdd7f96062c606845" },
  { src: "/2026/host.jpg", alt: "The main stage host at Applied AI Conf 2026", width: 853, height: 1280, key: "b4ccdef1066415dcf0ada429e341dcdc" },
  { src: "/2026/pair.jpg", alt: "Attendees at Applied AI Conf 2026", width: 853, height: 1280, key: "0cda8ab2f2b9e185c1b90c529cf383f1" },
  { src: "/2026/coffee.jpg", alt: "The Google DeepMind coffee bar at Applied AI Conf 2026", width: 1280, height: 853, key: "ded4a349de0a1bcbe6ccdde1e0d516b1" },
  { src: "/2026/runpod.jpg", alt: "The Runpod booth at Applied AI Conf 2026", width: 854, height: 1280, key: "50f74c54dbe9716ccc28bbd56d781d66" },
  { src: "/2026/presenting.jpg", alt: "Applied AI Conf 2026", width: 800, height: 1200, key: "f363137dc00cc889124d1526a8e216a1" },
  { src: "/2026/audience.jpg", alt: "The audience at Applied AI Conf 2026", width: 1280, height: 854, key: "0506ddcc40b5e1561d2c58b2680e32bc" },
  { src: "/2026/session.jpg", alt: "Attendees at Applied AI Conf 2026", width: 854, height: 1280, key: "03d47d1be22ff28167f08a216dc25948" },
  { src: "/2026/elastic.jpg", alt: "The Elastic booth at Applied AI Conf 2026", width: 854, height: 1280, key: "b04af12eb9067b4cd01874003f45bb03" },
  { src: "/2026/codex.jpg", alt: "The OpenAI Codex booth at Applied AI Conf 2026", width: 854, height: 1280, key: "b72c8bbcc662d5f3ce9a4684f562dd17" },
  { src: "/2026/networking.jpg", alt: "Attendees networking at Applied AI Conf 2026", width: 1280, height: 854, key: "113a161b7810857279f1111f86614473" },
  { src: "/2026/hallway.jpg", alt: "Attendees at Applied AI Conf 2026", width: 800, height: 1200, key: "79ecbe96fb4d20c34416fcba45411526" },
  { src: "/2026/stage.jpg", alt: "A volunteer in front of the Applied AI Conf 2026 logo wall", width: 1280, height: 854, key: "78eb550d51896e91d41630cac627f299" },
  { src: "/2026/main-stage.jpg", alt: "The main stage at Applied AI Conf 2026", width: 800, height: 1200, key: "652ed3c3de29329ac579fe96b8b4a895" },
  { src: "/2026/portrait.jpg", alt: "Celestia speaking at Applied AI Conf 2026", width: 800, height: 1200, key: "294abdfeeaa5f99ce697365e6bd7e8d0" },
  { src: "/2026/spotlight.jpg", alt: "A volunteer at Applied AI Conf 2026", width: 800, height: 1200, key: "366fec6818e3ecc7d34e8f742ee93763" },
];
