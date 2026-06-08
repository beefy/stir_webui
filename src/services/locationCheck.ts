/**
 * Banned locations — users from these places are not allowed to use the service.
 *
 * US States: Mississippi, South Dakota, Wyoming, Hawaii, Texas, Tennessee, Virginia, Kansas
 * Countries: Australia, France, Portugal, Italy, Greece
 */
export const BANNED_LOCATIONS = {
  // US States (ISO 3166-2 codes)
  usStates: [
    "MS", // Mississippi
    "SD", // South Dakota
    "WY", // Wyoming
    "HI", // Hawaii
    "TX", // Texas
    "TN", // Tennessee
    "VA", // Virginia
    "KS", // Kansas
  ] as string[],

  // Countries (ISO 3166-1 alpha-2 codes)
  countries: [
    "AU", // Australia
    "FR", // France
    "PT", // Portugal
    "IT", // Italy
    "GR", // Greece
  ] as string[],
} as const;

export interface LocationInfo {
  countryCode: string;
  regionCode: string | null; // US state code, null for non-US
  city: string;
  proxy: boolean; // true if the IP is a VPN/proxy
}

export interface LocationCheckResult {
  allowed: boolean;
  reason?: string;
  location: LocationInfo | null;
}

/**
 * Detect the user's location via a free IP geolocation API.
 * Uses ip-api.com which is free for non-commercial use (no API key needed).
 *
 * Fields requested:
 *   - status: success/fail
 *   - countryCode: ISO 3166-1 alpha-2
 *   - region: ISO 3166-2 region/state code
 *   - city: city name
 *   - proxy: whether the IP is a VPN/proxy/Tor exit node
 */
export async function detectLocation(): Promise<LocationInfo | null> {
  try {
    const response = await fetch("http://ip-api.com/json/?fields=status,countryCode,region,city,proxy");
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== "success") return null;

    return {
      countryCode: data.countryCode as string,
      regionCode: data.region as string | null,
      city: data.city as string,
      proxy: data.proxy === true,
    };
  } catch {
    // If geolocation fails, allow access by default (fail open)
    return null;
  }
}

/**
 * Check if a location is banned or if the user is using a VPN/proxy.
 */
export function isLocationBanned(location: LocationInfo): { banned: boolean; reason?: string } {
  // Check for VPN/proxy usage
  if (location.proxy) {
    return { banned: true, reason: "VPNs and proxies are not allowed. Please disable your VPN or proxy and try again." };
  }

  // Check country ban
  if (BANNED_LOCATIONS.countries.includes(location.countryCode)) {
    return { banned: true, reason: `Your country (${location.countryCode}) is not allowed to use this service.` };
  }

  // Check US state ban (only for US users)
  if (location.countryCode === "US" && location.regionCode) {
    if (BANNED_LOCATIONS.usStates.includes(location.regionCode)) {
      return { banned: true, reason: `Your state (${location.regionCode}) is not allowed to use this service.` };
    }
  }

  return { banned: false };
}

/**
 * Full check: detect location and verify it's allowed.
 */
export async function checkLocation(): Promise<LocationCheckResult> {
  const location = await detectLocation();

  if (!location) {
    // Could not detect location — allow access (fail open)
    return { allowed: true, location: null };
  }

  const { banned, reason } = isLocationBanned(location);
  if (banned) {
    return { allowed: false, reason, location };
  }

  return { allowed: true, location };
}
