export type CategoryInfo = {
  name: string;
  color: string;
  lightColor: string;
};

export const CATEGORIES: CategoryInfo[] = [
  { name: "Entertainment", color: "#e03e3e", lightColor: "#fdecea" },
  { name: "AI Tools", color: "#0f7b6c", lightColor: "#e6f5f0" },
  { name: "Developer Tools", color: "#8b5cf6", lightColor: "#f3e8ff" },
  { name: "Design", color: "#2f6fed", lightColor: "#eef3fd" },
  { name: "Productivity", color: "#10b981", lightColor: "#ecfdf5" },
  { name: "Cloud Storage", color: "#0ea5e9", lightColor: "#e0f2fe" },
  { name: "Music", color: "#f59e0b", lightColor: "#fef3c7" },
  { name: "Video", color: "#ef4444", lightColor: "#fee2e2" },
  { name: "News", color: "#6366f1", lightColor: "#eef2ff" },
  { name: "Gaming", color: "#10b981", lightColor: "#ecfdf5" },
  { name: "Education", color: "#8b5cf6", lightColor: "#f3e8ff" },
  { name: "Finance", color: "#0ea5e9", lightColor: "#e0f2fe" },
  { name: "Shopping", color: "#f97316", lightColor: "#fff7ed" },
  { name: "Communication", color: "#06b6d4", lightColor: "#ecfeff" },
  { name: "Security", color: "#ec4899", lightColor: "#fdf2f8" },
  { name: "Other", color: "#6b7280", lightColor: "#f3f4f6" },
];

export const CATEGORY_MAP: Record<string, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c])
);

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

const FALLBACK_COLORS = ["#e03e3e", "#ea7a53", "#d97706", "#6366f1"];

export function getCategoryColor(category: string, index: number): string {
  return CATEGORY_MAP[category]?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function getCategoryLightColor(category: string): string {
  return CATEGORY_MAP[category]?.lightColor ?? "#f3f4f6";
}
