import { AuthenticatedApp } from "@/components/layout/authenticated-app";

export default function PersonnelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthenticatedApp>{children}</AuthenticatedApp>;
}
