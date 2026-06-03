/**
 * Format a timestamp string from the API into a localized date/time string.
 *
 * The backend stores timestamps as UTC datetimes. Pydantic serializes them
 * as ISO 8601 strings. If the string ends with "Z" or includes a timezone
 * offset (e.g. "+00:00"), `new Date()` will parse it correctly as UTC.
 *
 * However, if the string is offset-naive (no "Z" or offset), JavaScript's
 * `Date` constructor may interpret it as local time. To be safe, we append
 * "Z" to force UTC interpretation when no timezone is present.
 */
export function formatTime(iso: string): string {
  // If the string doesn't end with "Z" and doesn't contain a timezone offset
  // (e.g. "+00:00" or "-05:00"), treat it as UTC by appending "Z".
  const normalized = /[Z+-]\d{2}:\d{2}$/.test(iso) || iso.endsWith("Z")
    ? iso
    : iso + "Z";

  return new Date(normalized).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
