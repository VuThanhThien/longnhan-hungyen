type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
};

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === 'center' ? 'text-center max-w-2xl mx-auto mb-12' : 'mb-10'
      }
    >
      <h2 className="landing-heading text-3xl sm:text-4xl font-semibold text-(--brand-forest) tracking-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-lg text-(--brand-forest-muted) leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
