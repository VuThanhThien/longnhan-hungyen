'use client';

/** Client-only so the layout footer stays statically prerenderable. */
export function CopyrightYear() {
  return <>{new Date().getFullYear()}</>;
}
