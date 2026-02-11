// Google Fonts URLs for the fonts we use
const FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap",
];

// Cache for font CSS to avoid refetching
let fontEmbedCSSCache: string | null = null;

export async function getFontEmbedCSS(): Promise<string> {
  if (fontEmbedCSSCache) return fontEmbedCSSCache;

  try {
    // Fetch all font CSS files
    const cssPromises = FONT_URLS.map(async (url) => {
      const response = await fetch(url);
      return response.text();
    });

    const cssTexts = await Promise.all(cssPromises);
    let combinedCSS = cssTexts.join("\n");

    // Extract all font URLs from the CSS and convert them to base64
    const fontUrlRegex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g;
    const fontUrls = new Set<string>();
    let match;
    while ((match = fontUrlRegex.exec(combinedCSS)) !== null) {
      fontUrls.add(match[1]);
    }

    // Fetch and convert each font to base64
    const fontDataMap = new Map<string, string>();
    await Promise.all(
      Array.from(fontUrls).map(async (fontUrl) => {
        try {
          const response = await fetch(fontUrl);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          fontDataMap.set(fontUrl, base64);
        } catch (e) {
          console.warn("Failed to fetch font:", fontUrl, e);
        }
      })
    );

    // Replace all font URLs with base64 data URLs
    fontDataMap.forEach((base64, url) => {
      combinedCSS = combinedCSS.split(url).join(base64);
    });

    fontEmbedCSSCache = combinedCSS;
    return combinedCSS;
  } catch (e) {
    console.warn("Failed to fetch font CSS:", e);
    return "";
  }
}
