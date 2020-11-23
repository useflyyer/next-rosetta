/**
 * Locales should implement this interface
 * Only serializable objects are supported right now (i.e: no functions).
 */
export interface MyLocale {
  locale: string;
  title: string;
  subtitle: string;
  about: {
    title: string;
    subtitle: string;
  };
  welcome: string;
}
