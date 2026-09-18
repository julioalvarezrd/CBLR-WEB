import type { ReactNode } from "react";

import {
  AppHeader,
  type AppNavigationGroup,
} from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

type AppShellProps = {
  children: ReactNode;
  navigation: readonly AppNavigationGroup[];
  user: {
    name: string;
    email: string;
  };
};

export function AppShell({ children, navigation, user }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader navigation={navigation} user={user} />

      <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
