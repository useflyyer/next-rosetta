import { GetStaticProps } from "next";
import { useI18n, I18nProps } from "next-rosetta";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { MyLocale } from "../i18n";

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
        <h1>{t("about.title")}</h1>
        <p>{t("about.subtitle")}</p>
        <ul>
          {locales?.map((loc) => (
            <li key={loc}>
              <Link href={route} locale={loc}>
                <a className={loc === locale ? "is-active" : ""}>{loc}</a>
              </Link>
            </li>
          ))}
        </ul>
        <hr />
        <Link href="/">Home</Link>
      </main>
    </div>
  );
}

// Server-side code
export const getStaticProps: GetStaticProps<I18nProps<MyLocale>> = async (context) => {
  const locale = context.locale || context.defaultLocale;
  const { table = {} } = await import(`../i18n/${locale}`);
  return { props: { table } }; // Passed to `/pages/_app.tsx`
};
