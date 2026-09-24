import { NextResponse } from "next/server";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { getGuardPersonnelCandidate } from "@/modules/guards/guard.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim() ?? "";

  if (!code) {
    return NextResponse.json(
      { error: "Debes indicar un código institucional." },
      { status: 400 },
    );
  }

  try {
    const member = await getGuardPersonnelCandidate(code);
    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json(
      { error: getActionErrorMessage(error) },
      { status: 400 },
    );
  }
}
