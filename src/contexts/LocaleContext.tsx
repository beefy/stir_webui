import { createContext, useContext, useState, type ReactNode } from "react";
import type { Locale, Translations } from "../i18n";
import { getTranslations } from "../i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "stir_locale";

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "de" || stored === "zh") return stored;
  } catch {
    // Ignore
  }
  // Try browser language
  const lang = navigator.language?.slice(0, 2);
  if (lang === "de") return "de";
  if (lang === "zh") return "zh";
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Ignore
    }
  };

  const translations = getTranslations(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, translations }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
