import { usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

export type SupportedLocale = "en" | "bn";

type LocalizationEntry = {
  en?: string | null;
  bn?: string | null;
};

type LocalizationOption = {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
};

type LocalizationPayload = {
  defaultLocale?: SupportedLocale;
  availableLocales?: LocalizationOption[];
  translations?: Record<string, LocalizationEntry>;
};

const LOCALE_STORAGE_KEY = "futurebd.active-locale";
const LOCALE_EVENT_NAME = "futurebd:locale-change";

function normalizeOptions(options?: LocalizationOption[]): LocalizationOption[] {
  if (!options || options.length === 0) {
    return [
      { code: "en", label: "English", nativeLabel: "English" },
      { code: "bn", label: "Bangla", nativeLabel: "বাংলা" },
    ];
  }

  return options;
}

function resolveLocale(defaultLocale: SupportedLocale, options: LocalizationOption[]): SupportedLocale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale | null;

  if (storedLocale && options.some((option) => option.code === storedLocale)) {
    return storedLocale;
  }

  return defaultLocale;
}

function applyLocaleToDocument(locale: SupportedLocale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale === "bn" ? "bn-BD" : "en";
  document.documentElement.dataset.locale = locale;
}

function interpolate(template: string, replacements?: Record<string, string | number>) {
  if (!replacements) {
    return template;
  }

  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replaceAll(`:${key}`, String(value)),
    template,
  );
}

export function useLocalization() {
  const { localization } = usePage<{ localization?: LocalizationPayload }>().props;
  const availableLocales = useMemo(
    () => normalizeOptions(localization?.availableLocales),
    [localization?.availableLocales],
  );
  const defaultLocale = availableLocales.some((option) => option.code === localization?.defaultLocale)
    ? (localization?.defaultLocale as SupportedLocale)
    : "en";

  const [locale, setLocaleState] = useState<SupportedLocale>(() => resolveLocale(defaultLocale, availableLocales));

  useEffect(() => {
    const nextLocale = resolveLocale(defaultLocale, availableLocales);
    setLocaleState((current) => (
      availableLocales.some((option) => option.code === current)
        ? current
        : nextLocale
    ));
  }, [defaultLocale, availableLocales]);

  useEffect(() => {
    applyLocaleToDocument(locale);
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleCustomLocaleChange = (event: Event) => {
      const nextLocale = (event as CustomEvent<SupportedLocale>).detail;

      if (availableLocales.some((option) => option.code === nextLocale)) {
        setLocaleState(nextLocale);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOCALE_STORAGE_KEY) {
        return;
      }

      setLocaleState(resolveLocale(defaultLocale, availableLocales));
    };

    window.addEventListener(LOCALE_EVENT_NAME, handleCustomLocaleChange as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(LOCALE_EVENT_NAME, handleCustomLocaleChange as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [availableLocales, defaultLocale]);

  const setLocale = (nextLocale: SupportedLocale) => {
    if (!availableLocales.some((option) => option.code === nextLocale)) {
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      window.dispatchEvent(new CustomEvent<SupportedLocale>(LOCALE_EVENT_NAME, { detail: nextLocale }));
    }

    applyLocaleToDocument(nextLocale);
    setLocaleState(nextLocale);
  };

  const t = (key: string, fallback: string, replacements?: Record<string, string | number>) => {
    const entry = localization?.translations?.[key];
    const template = locale === "bn"
      ? entry?.bn || entry?.en || fallback
      : entry?.en || fallback;

    return interpolate(template, replacements);
  };

  return {
    locale,
    setLocale,
    t,
    availableLocales,
    isBangla: locale === "bn",
  };
}
