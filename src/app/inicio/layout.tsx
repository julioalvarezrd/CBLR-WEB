import { AuthenticatedApp } from "@/components/layout/authenticated-app";

export const dynamic = "force-dynamic";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedApp>{children}</AuthenticatedApp>;
}
