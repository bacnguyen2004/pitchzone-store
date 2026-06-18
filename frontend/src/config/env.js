function readEnv(key, fallback = "") {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value).trim();
}

function stripTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

/** Django REST API — bao gồm suffix /api */
export function getApiBaseUrl() {
  return stripTrailingSlash(
    readEnv("VITE_API_BASE_URL", "http://127.0.0.1:8000/api"),
  );
}

/** Origin backend phục vụ ảnh /media/ */
export function getMediaBaseUrl() {
  const explicit = readEnv("VITE_MEDIA_BASE_URL");
  if (explicit) {
    return stripTrailingSlash(explicit);
  }

  const apiBase = getApiBaseUrl();
  return apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
}

export function getAddressApiBase() {
  return stripTrailingSlash(
    readEnv("VITE_ADDRESS_API_BASE", "https://provinces.open-api.vn/api/v2"),
  );
}

export function getAppName() {
  return readEnv("VITE_APP_NAME", "PitchZone");
}

export function getFreeShippingThreshold() {
  const raw = readEnv("VITE_FREE_SHIPPING_THRESHOLD", "2000000");
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 2_000_000;
}

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  mediaBaseUrl: getMediaBaseUrl(),
  addressApiBase: getAddressApiBase(),
  appName: getAppName(),
  freeShippingThreshold: getFreeShippingThreshold(),
};