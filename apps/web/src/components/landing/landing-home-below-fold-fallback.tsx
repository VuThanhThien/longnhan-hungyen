/** Placeholder while below-the-fold home sections stream in. */
export function LandingHomeBelowFoldFallback() {
  return (
    <div
      className="landing-below-fold-fallback"
      aria-hidden
      data-testid="landing-below-fold-fallback"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="h-8 w-48 animate-pulse rounded-md bg-(--brand-forest)/10" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-4/3 animate-pulse rounded-xl bg-(--brand-forest)/8"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
