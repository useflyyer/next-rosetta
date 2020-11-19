import React, { useContext, createContext, useState, useEffect } from "react";

import { useRouter } from "next/router";
import rosetta, { Rosetta } from "rosetta";

export type { Rosetta };

export const I18nContext = createContext<Rosetta<any> | null>(null);

export function useI18n<T = any>() {
  const instance = useContext<Rosetta<T> | null>(I18nContext);
  if (!instance) {
    throw new Error("There was an error getting i18n instance from context");
  }
  return instance;
}

export type I18nProps<T = any> = {
  table: T;
};

export type I18nProviderProps<T = any> = I18nProps<T> & {
  children?: any;
};

export function I18nProvider<T = any>({ table, ...props }: I18nProviderProps<T>) {
  const { locale } = useRouter();

  const [i18n, setI18n] = useState<Rosetta<T>>(() => {
    // Initial state
    const current = rosetta<T>();
    current.set(locale!, table);
    current.locale(locale);
    return current;
  });

  const hasChanged = i18n.locale() !== locale;

  useEffect(() => {
    const current = rosetta<T>();
    current.set(locale!, table);
    current.locale(locale);
    setI18n(current);
  }, [hasChanged, table]);

  return <I18nContext.Provider value={i18n} {...props} />;
}
