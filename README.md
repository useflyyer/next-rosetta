# next-rosetta 🌎🌍🌏

> Add i18n in less than 5 minutes — **Built for Next.js 10**

![demo](./.github/demo.gif)

Lightweight, simple, easy to integrate, extendable, no custom server required and efficient because it will only download the required translations for your current locale.

[See live demo](https://next-rosetta.vercel.app)

Supports typed locales via the Template literal and Recursive types. **Requires TypeScript >=4.1.0**

![typescript intellisense example](./.github/typing.png)

## Usage

### Install

First step: downloading this dependency.

```sh
# with npm
npm install next-rosetta

# with yarn
yarn add next-rosetta
```

### Update next.config.js

Update your `next.config.js` by adding a `i18n` section:

```js
// ./next.config.js
module.exports = {
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
  },
};
```

For more info refer to: https://nextjs.org/docs/advanced-features/i18n-routing

### Create locales

Make a directory named `i18n` on the root of your project. If you are using TypeScript you can define the type schema and create every locale based on that interface. **Type safety! Excelente!**

```js
// ./i18n/index.tsx
export interface MyLocale {
  locale: string;
  title: string;
  subtitle: string;
  profile: {
    button: string;
  };
  welcome: string;
}
```

```js
// ./i18n/en.tsx
import { MyLocale } from ".";

export const table: MyLocale = {
  locale: "English",
  title: "Next.js 10 + Rosetta with native i18n integration",
  subtitle: "Click below to update your current locale 👇",
  profile: {
    button: "Press me!",
  },
  welcome: "Welcome {{name}}! 😃", // with variable replacement
};
```

```js
// ./i18n/es.tsx
import { MyLocale } from ".";

export const table: MyLocale = {
  locale: "Español",
  title: "Next.js 10 + Rosetta con integración nativa de i18n",
  subtitle: "Presiona aquí abajo para cambiar tu lenguaje 👇",
  profile: {
    button: "Presióname!",
  },
  welcome: "Bienvenido {{name}}! 👋", // with variable replacement
};
```

### Add the i18n provider

Import `I18nProvider` from `"next-rosetta"` and wrap your app in it. From `pageProps` take `table` which is the current locale object and pass it to `I18nProvider`.

```tsx
// ./pages/_app.tsx
import { AppProps } from "next/app";
import { I18nProvider } from "next-rosetta";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider table={pageProps.table}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}

export default MyApp;
```

## Load and render

To import locales you must call this on the server side code (or on the static render):

```ts
const locale = "en";
const { table = {} } = await import(`../i18n/${locale}`);
```

Here is an example if you are using `getStaticProps`:

```tsx
// ./pages/index.tsx
import { GetStaticProps } from "next";
import { useI18n, I18nProps } from "next-rosetta";

// Import typing
import { MyLocale } from "../i18n";

function HomePage() {
  const { t } = useI18n<MyLocale>();
  return (
    <div>
      <h3>
        {t("title")}
      </h3>
      <p>
        {t("welcome", { name: "John" })}
      </p>
      <button>
        {t("profile.button")}
      </button>
    </div>
  )
}

// You can use I18nProps<T> for type-safety (optional)
export const getStaticProps: GetStaticProps<I18nProps<MyLocale>> = async (context) => {
  const locale = context.locale || context.defaultLocale;
  const { table = {} } = await import(`../i18n/${locale}`); // Import locale
  return { props: { table } }; // Passed to `/pages/_app.tsx`
};
```

Any component can access the locale translations by using the `useI18n` hook.

```tsx
// ./pages/index.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useI18n } from "next-rosetta";

function LocaleSelector() {
  const { locale, locales, route } = useRouter(); // Get current locale and locale list
  const { t } = useI18n();
  // ...
}
```

For more info regarding `rosetta` API please refer to: https://github.com/lukeed/rosetta

## Example

Here is a more complete example of page inside the `/page` directory:

```tsx
// ./pages/index.tsx
import { useI18n, I18nProps } from "next-rosetta";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

import { MyLocale } from "../i18n"; // Import typing

export default function Home() {
  const { locale, locales, route } = useRouter();
  const i18n = useI18n<MyLocale>();
  const { t } = i18n;

  return (
    <div>
      <Head>
        <title>{t("locale")}</title>
      </Head>
      <main>
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
        <p>{t("welcome", { name: "John" })}</p>
        <ul>
          {locales?.map((loc) => (
            <li key={loc}>
              <Link href={route} locale={loc}>
                <a className={loc === locale ? "is-active" : ""}>{loc}</a>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

// Server-side code

import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps<I18nProps<MyLocale>> = async (context) => {
  const locale = context.locale || context.defaultLocale;
  const { table = {} } = await import(`../i18n/${locale}`); // Import locale
  return { props: { table } }; // Passed to `/pages/_app.tsx`
};
```

### Example with getServerSideProps

This is compatible with your current server side logic. Here is an example:

```tsx
// ./pages/posts/[id].tsx
import { GetServerSideProps } from "next";
import { useI18n, I18nProps } from "next-rosetta";

type Props = { post: any };

export default function PostPage({ post, ...props }: Props) {
  const { t } = useI18n();
  // ...
}

export const getServerSideProps: GetServerSideProps<Props & I18nProps> = async (context) => {
  const locale = context.locale || context.defaultLocale;

  const data = await fetch(`/posts/${context.params["id"]}`).then(res => res.json());

  const { table = {} } = await import(`../../i18n/${locale}`);
  return { props: { table, post: data } };
};
```

## FAQ

### Is a JSON locale table supported?

Yes. Just import is as `await import(`../../i18n/${locale}.json`);`

## TODO

- Support pluralization.
- Support function definitions with arguments. Only serializable locales are working right now.
