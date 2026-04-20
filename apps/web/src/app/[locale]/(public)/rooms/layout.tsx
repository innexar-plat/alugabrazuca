import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'AlugaBrazuca';

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: `${t('metaTitle')} | ${appName}`,
      description: t('metaDescription'),
      type: 'website',
    },
  };
}

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
