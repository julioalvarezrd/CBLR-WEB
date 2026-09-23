import { NextResponse } from "next/server";

import { getActionErrorMessage } from "@/modules/auth/action-errors";
import { getPersonnelForUserIntegration } from "@/modules/auth/users/user.service";

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
    const member = await getPersonnelForUserIntegration(code);

    if (!member) {
      return NextResponse.json(
        { error: "No se encontró un miembro con ese código institucional." },
        { status: 404 },
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json(
      { error: getActionErrorMessage(error) },
      { status: 403 },
    );
  }
}
