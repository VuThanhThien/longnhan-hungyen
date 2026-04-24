'use client';

import { useEffect, useRef } from 'react';

export function SepayRedirectForm({
  url,
  fields,
}: {
  url: string;
  fields: Record<string, string>;
}) {
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    ref.current?.submit();
  }, []);

  return (
    <form ref={ref} action={url} method="POST" className="hidden">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit">Tiếp tục đến SePay</button>
    </form>
  );
}
