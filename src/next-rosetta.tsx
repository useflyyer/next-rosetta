import React, { useContext, createContext, useRef } from "react";

import { useRouter } from "next/router";
import rosetta, { Rosetta as RosettaBase } from "rosetta";

type Key = string | number | bigint | symbol;

/**
 * @see https://github.com/microsoft/TypeScript/pull/40336
 */
type PropType<T, Path extends Key> = string extends Path
  ? unknown
  : Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PropType<T[K], R>
    : unknown
  : unknown;

type Join<T extends unknown[], D extends string> = T extends []
  ? ""
  : T extends [string | number | boolean | bigint]
  ? `${T[0]}`
  : T extends [string | number | boolean | bigint, ...infer U]
  ? `${T[0]}${D}${Join<U, D>}`
  : string;

// TODO: Improve TS types for object paths
// t("about") -> supported typing
// t("about.title") -> supported typing
// t(["about", "title"]) -> unsupported typing
// t(["about.title"]) -> unsupported typing

export interface RosettaExtended<T> extends Omit<RosettaBase<T>, "t"> {
  /**
   * Inter type from property path (note: using array as path won't infer type)
   * @example <caption>Infer type</caption>
   * const title = t("title");
   * const text = t("landing.title");
   * @example <caption>Force type.</caption>
   * const text = t<string>(["landing", "title"]);
   * const text = t<string>(["landing.feature", index, "description"]);
   */
  t<P extends Key | Key[], X extends Record<string, any> | any[]>(
    key: P,
    params?: X,
    lang?: string,
  ): P extends Key[] ? PropType<T, Join<P, ".">> : P extends Key ? PropType<T, P> : unknown;
  /**
   * Force or overwrite type
   * @example <caption>Infer type</caption>
   * const title = t("title");
   * const text = t("landing.title");
   * @example <caption>Force type.</caption>
   * const text = t<string>(["landing", "title"]);
   * const text = t<string>(["landing.feature", index, "description"]);
   */
  t<F extends any, X extends Record<string, any> | any[] = Record<string, any> | any[]>(
    key: Key | Key[],
    params?: X,
    lang?: string,
  ): F;
}

/**
 * Use <I18nProvider /> instead of this internal context.
 */
export const I18nContext = createContext<RosettaExtended<any> | null>(null);

/**
 * @example <caption>Simple</caption>
 * const { t } = useI18n()
 * const text = t("title")
 * @example <caption>With types</caption>
 * interface LocaleTable { title: string; }
 * const { t } = useI18n<LocaleTable>()
 * const text = t("title")
 */
export function useI18n<T = any>() {
  const instance = useContext<RosettaExtended<T> | null>(I18nContext);
  if (!instance) {
    throw new Error("There was an error getting i18n instance from context");
  }
  return instance;
}

/**
 * @example
 * import type { GetStaticProps } from "next";
 * import type { I18nProps } from "next-rosetta";
 * interface MyLocale { title: string }
 * export const getStaticProps: GetStaticProps<I18nProps<MyLocale>> = async (context) => {
 *  // ...
 * }
 */
export type I18nProps<T = any> = {
  table: T;
};

export type I18nProviderProps<T = any> = I18nProps<T> & {
  children?: any;
};

/**
 * You probably want to add this at the root of your project. If you are using Next.js add it to `_app.tsx`.
 */
export function I18nProvider<T = any>({ table, ...props }: I18nProviderProps<T>) {
  const i18nRef = useRef(rosetta());
  const { locale = "en", defaultLocale = ["en"] } = useRouter();

  i18nRef.current.set(locale ?? defaultLocale, table);
  i18nRef.current.locale(locale);

  return <I18nContext.Provider value={i18nRef.current} {...props} />;
}
