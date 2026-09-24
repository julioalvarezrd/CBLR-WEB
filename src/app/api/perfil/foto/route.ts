import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(null, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        personnelMember: {
          select: {
            photoData: true,
            photoMimeType: true,
          },
        },
      },
    });

    const member = user?.personnelMember;
    if (!member?.photoData || !member.photoMimeType) {
      return new Response(null, { status: 404 });
    }

    return new Response(Buffer.from(member.photoData), {
      headers: {
        "Content-Type": member.photoMimeType,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 403 });
  }
}
