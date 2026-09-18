"use server";

import { signIn, signOut } from "@/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");

  await signIn("credentials", {
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
    redirectTo: "/inicio",
  });
}

export async function logoutAction(): Promise<void> {
  await signOut({
    redirectTo: "/login",
  });
}
