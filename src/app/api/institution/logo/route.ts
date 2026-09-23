import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.institutionalSettings.findUnique({
    where: { id: 1 },
    select: { logoData: true, logoMimeType: true },
  });

  if (!settings?.logoData || !settings.logoMimeType) {
    return new Response(null, { status: 404 });
  }

  return new Response(Buffer.from(settings.logoData), {
    headers: {
      "Content-Type": settings.logoMimeType,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
