import React, { useContext, useRef, createContext } from "react";
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

  const i18n = useRef<Rosetta<T> | null>(null);
  if (!i18n.current) {
    i18n.current = rosetta<T>();
    i18n.current.set(locale!, table);
    i18n.current.locale(locale);
  } else if (i18n.current.locale() !== locale) {
    i18n.current.set(locale!, table);
    i18n.current.locale(locale);
  }

  return <I18nContext.Provider value={i18n.current} {...props} />;
}
