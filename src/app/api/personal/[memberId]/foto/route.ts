import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/modules/auth/permissions/authorization";

export const dynamic = "force-dynamic";

type PersonnelPhotoRouteProps = {
  params: Promise<{ memberId: string }>;
};

export async function GET(_request: Request, { params }: PersonnelPhotoRouteProps) {
  try {
    await requirePermission("personal.view");
    const { memberId } = await params;
    const member = await prisma.personnelMember.findUnique({
      where: { id: memberId },
      select: { photoData: true, photoMimeType: true },
    });

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
