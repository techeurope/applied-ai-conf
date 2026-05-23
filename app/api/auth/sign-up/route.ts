import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const returnTo =
    params.get("returnTo") ?? params.get("return_to") ?? undefined;
  const loginHint =
    params.get("loginHint") ?? params.get("login_hint") ?? undefined;
  const url = await getSignUpUrl({ returnTo, loginHint });
  redirect(url);
}
