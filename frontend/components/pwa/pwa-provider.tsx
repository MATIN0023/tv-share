"use client";

import { OfflineBanner } from "./offline-banner";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
