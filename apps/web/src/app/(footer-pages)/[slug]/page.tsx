import { FooterPageLayout } from '@/components/footer-page-layout';
import { FOOTER_PAGES, getFooterPageBySlug } from '@/data/footer-pages';
import { buildSeoMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FOOTER_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = getFooterPageBySlug(slug);
  if (!page) return {};
  return buildSeoMetadata({
    title: page.title,
    description: page.seoDescription,
    canonicalPath: `/${slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = getFooterPageBySlug(slug);
  if (!page) notFound();
  return <FooterPageLayout page={page} />;
}
