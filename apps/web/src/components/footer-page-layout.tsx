import type { FooterPageData } from '@/data/footer-pages';
import { buildBreadcrumb, type BreadcrumbItem } from '@/lib/breadcrumb';
import Breadcrumb from '@/components/ui/breadcrumb';

export function FooterPageLayout({ page }: { page: FooterPageData }) {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Trang chủ', url: '/' },
    { label: page.title },
  ];
  const { schema: breadcrumbSchema } = buildBreadcrumb({
    items: breadcrumbItems,
    currentUrl: `/${page.slug}`,
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      ) : null}
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="landing-heading mb-8 text-2xl font-bold text-(--brand-forest) md:text-3xl">
        {page.title}
      </h1>

      <div className="space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-lg font-semibold text-(--brand-forest)">
              {section.heading}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-(--brand-forest)/80 md:text-base">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
