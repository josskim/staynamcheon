"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import FloatingContact from "./FloatingContact";

export default function AppLayoutControls({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      {children}
      <FloatingContact />
    </>
  );
}
