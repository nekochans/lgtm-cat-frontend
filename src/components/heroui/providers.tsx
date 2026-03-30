// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <ToastProvider />
      {children}
    </NextThemesProvider>
  );
}
