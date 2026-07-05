import { type ServiceCategory } from "./settingsStore";

export function getLogoUrl(domain: string, size = 128): string {
  const token = process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN;
  if (!token) {
    throw new Error("Missing EXPO_PUBLIC_LOGO_DEV_TOKEN in .env");
  }
  return `https://img.logo.dev/${domain}?token=${token}&size=${size}&retina=true&format=png&fallback=monogram`;
}

export interface ServiceEntry {
  name: string;
  domain: string;
  category: ServiceCategory;
}

export type { ServiceCategory } from "./settingsStore";

export const POPULAR_SERVICES: ServiceEntry[] = [
  { name: "Netflix", domain: "netflix.com", category: "Entertainment" },
  { name: "Spotify", domain: "spotify.com", category: "Music" },
  { name: "YouTube Premium", domain: "youtube.com", category: "Video" },
  { name: "Disney+", domain: "disneyplus.com", category: "Video" },
  { name: "Hulu", domain: "hulu.com", category: "Video" },
  { name: "HBO Max", domain: "max.com", category: "Video" },
  { name: "Apple TV+", domain: "tv.apple.com", category: "Video" },
  { name: "Apple Music", domain: "music.apple.com", category: "Music" },
  { name: "Paramount+", domain: "paramountplus.com", category: "Video" },
  { name: "Peacock", domain: "peacocktv.com", category: "Video" },
  { name: "Crunchyroll", domain: "crunchyroll.com", category: "Video" },
  { name: "Tidal", domain: "tidal.com", category: "Music" },
  { name: "ChatGPT", domain: "chat.openai.com", category: "AI Tools" },
  { name: "Claude", domain: "claude.ai", category: "AI Tools" },
  { name: "Midjourney", domain: "midjourney.com", category: "AI Tools" },
  { name: "GitHub", domain: "github.com", category: "Developer Tools" },
  { name: "GitLab", domain: "gitlab.com", category: "Developer Tools" },
  { name: "npm", domain: "npmjs.com", category: "Developer Tools" },
  { name: "Vercel", domain: "vercel.com", category: "Developer Tools" },
  { name: "Netlify", domain: "netlify.com", category: "Developer Tools" },
  { name: "AWS", domain: "aws.amazon.com", category: "Cloud Storage" },
  { name: "Google Cloud", domain: "cloud.google.com", category: "Cloud Storage" },
  { name: "Microsoft Azure", domain: "azure.microsoft.com", category: "Cloud Storage" },
  { name: "Adobe Creative Cloud", domain: "adobe.com", category: "Design" },
  { name: "Canva", domain: "canva.com", category: "Design" },
  { name: "Figma", domain: "figma.com", category: "Design" },
  { name: "Sketch", domain: "sketch.com", category: "Design" },
  { name: "Notion", domain: "notion.so", category: "Productivity" },
  { name: "Slack", domain: "slack.com", category: "Communication" },
  { name: "Zoom", domain: "zoom.us", category: "Communication" },
  { name: "Microsoft 365", domain: "microsoft.com", category: "Productivity" },
  { name: "Google Workspace", domain: "workspace.google.com", category: "Productivity" },
  { name: "Dropbox", domain: "dropbox.com", category: "Cloud Storage" },
  { name: "OneDrive", domain: "onedrive.live.com", category: "Cloud Storage" },
  { name: "iCloud+", domain: "icloud.com", category: "Cloud Storage" },
  { name: "Grammarly", domain: "grammarly.com", category: "Productivity" },
  { name: "1Password", domain: "1password.com", category: "Security" },
  { name: "LastPass", domain: "lastpass.com", category: "Security" },
  { name: "NordVPN", domain: "nordvpn.com", category: "Security" },
  { name: "ExpressVPN", domain: "expressvpn.com", category: "Security" },
  { name: "Duolingo", domain: "duolingo.com", category: "Education" },
  { name: "Coursera", domain: "coursera.org", category: "Education" },
  { name: "Skillshare", domain: "skillshare.com", category: "Education" },
  { name: "Medium", domain: "medium.com", category: "News" },
  { name: "Substack", domain: "substack.com", category: "News" },
  { name: "The New York Times", domain: "nytimes.com", category: "News" },
  { name: "The Washington Post", domain: "washingtonpost.com", category: "News" },
  { name: "PlayStation Plus", domain: "playstation.com", category: "Gaming" },
  { name: "Xbox Game Pass", domain: "xbox.com", category: "Gaming" },
  { name: "Nintendo Switch Online", domain: "nintendo.com", category: "Gaming" },
  { name: "Twitch", domain: "twitch.tv", category: "Entertainment" },
  { name: "Amazon Prime", domain: "amazon.com", category: "Shopping" },
  { name: "Costco", domain: "costco.com", category: "Shopping" },
  { name: "Sams Club", domain: "samsclub.com", category: "Shopping" },
  { name: "DoorDash", domain: "doordash.com", category: "Shopping" },
  { name: "Uber One", domain: "uber.com", category: "Shopping" },
  { name: "LinkedIn Premium", domain: "linkedin.com", category: "Productivity" },
  { name: "Adobe Fonts", domain: "fonts.adobe.com", category: "Design" },
  { name: "Audible", domain: "audible.com", category: "Entertainment" },
];

export function searchServices(query: string): ServiceEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return POPULAR_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.domain.toLowerCase().includes(q),
  ).slice(0, 8);
}
