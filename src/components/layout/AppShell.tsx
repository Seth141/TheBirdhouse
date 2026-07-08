import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerVariant?: "home" | "page";
}

/** Shared page chrome: header + scrollable content. */
export function AppShell({
  children,
  title,
  subtitle,
  headerVariant = "page",
}: AppShellProps) {
  return (
    <>
      <Header title={title} subtitle={subtitle} variant={headerVariant} />
      <main className="flex-1 px-5 pb-8 pt-5">{children}</main>
    </>
  );
}
