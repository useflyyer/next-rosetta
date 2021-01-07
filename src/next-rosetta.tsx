import React, { useContext, createContext, useState, useEffect } from "react";

import { useRouter } from "next/router";
import rosetta, { Rosetta as RosettaBase } from "rosetta";

/**
 * @see https://github.com/microsoft/TypeScript/pull/40336
 */
type PropType<T, Path extends string> = string extends Path
  ? unknown
  : Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PropType<T[K], R>
    : unknown
  : unknown;

export function rosettaExtended<T>(): RosettaExtended<T> {
  const base = rosetta<T>();
  return {
    ...base,
    t<P extends string, X extends Record<string, any> | any[]>(key: P, params?: X, lang?: string): PropType<T, P> {
      return base.t(key, params, lang) as any;
    },
  };
}

export interface RosettaExtended<T> extends Omit<RosettaBase<T>, "t"> {
  t<P extends string, X extends Record<string, any> | any[]>(key: P, params?: X, lang?: string): PropType<T, P>;
}

export const I18nContext = createContext<RosettaExtended<any> | null>(null);

export function useI18n<T = any>() {
  const instance = useContext<RosettaExtended<T> | null>(I18nContext);
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

  const [i18n, setI18n] = useState<RosettaExtended<T>>(() => {
    // Initial state
    const current = rosettaExtended<T>();
    current.set(locale!, table);
    current.locale(locale);
    return current;
  });

  const hasChanged = i18n.locale() !== locale;

  useEffect(() => {
    const current = rosettaExtended<T>();
    current.set(locale!, table);
    current.locale(locale);
    setI18n(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanged, table]);

  return <I18nContext.Provider value={i18n} {...props} />;
}
