import * as SecureStore from "expo-secure-store";
import { CURRENCIES } from "./settingsStore";

const CACHE_KEY = "subradar-exchange-rates-v2"; // bumped to invalidate stale cache
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SUPPORTED = new Set(CURRENCIES.map((c) => c.code));

interface CachedRates {
  timestamp: number;
  rates: Record<string, number>;
}

let inMemoryRates: CachedRates | null = null;

async function loadCached(): Promise<CachedRates | null> {
  if (inMemoryRates) return inMemoryRates;
  try {
    const raw = await SecureStore.getItemAsync(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedRates = JSON.parse(raw);
    if (!parsed.rates || !parsed.rates.USD) return null;
    inMemoryRates = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function saveCached(rates: Record<string, number>): Promise<void> {
  inMemoryRates = rates;
  try {
    await SecureStore.setItemAsync(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), rates }),
    );
  } catch {
    // storage full or unavailable — in-memory cache still works
  }
}

// Always fetch USD-based rates so conversion is simple multiplication.
// rates["INR"] = 83 means 1 USD = 83 INR.
export async function getExchangeRates(): Promise<Record<string, number>> {
  const cached = await loadCached();
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.rates;
  }

  try {
    const res = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Only keep the currencies we actually use (~15 vs ~160)
    const filtered: Record<string, number> = { USD: 1 };
    for (const code of SUPPORTED) {
      if (code !== "USD" && data.rates[code] !== undefined) {
        filtered[code] = data.rates[code];
      }
    }
    console.log("[currency] Fetched rates:", filtered);
    await saveCached(filtered);
    return filtered;
  } catch (e) {
    console.warn("[currency] Failed to fetch rates:", e);
    if (cached) return cached;
    return { USD: 1 };
  }
}

// Convert `amount` from `from` currency to `to` currency using USD-based rates.
// rates["INR"] = 83 means 1 USD = 83 INR.
// To convert 10 USD → INR: 10 * rates["INR"] = 830.
// To convert 830 INR → USD: 830 / rates["INR"] = 10.
export function convertSync(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (from === to) return amount;
  if (from === "USD") return amount * (rates[to] ?? 1);
  if (to === "USD") return amount / (rates[from] ?? 1);
  // both non-USD: go through USD
  return amount / (rates[from] ?? 1) * (rates[to] ?? 1);
}

// Debug-friendly version that logs
export function debugConvert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  const result = convertSync(amount, from, to, rates);
  console.log(
    `[currency] convert ${amount} ${from} → ${to} = ${result} (rates keys: ${Object.keys(rates).join(",")})`,
  );
  return result;
}
