import en from "./en";
import de from "./de";
import zh from "./zh";
import type { Translations } from "./en";

export type Locale = "en" | "de" | "zh";

const locales: Record<Locale, Translations> = { en, de, zh };

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  zh: "中文",
};

export function getTranslations(locale: Locale): Translations {
  return locales[locale] ?? en;
}

/** Simple template interpolation: replaces {key} with the corresponding value. */
export function t(
  translations: Translations,
  key: keyof Translations,
  params?: Record<string, string | number>
): string {
  let value = translations[key];
  if (value === undefined) {
    // Fallback to English
    value = en[key] ?? String(key);
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}

export { type Translations };
