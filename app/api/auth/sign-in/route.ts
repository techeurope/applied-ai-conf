import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  // Accept both camelCase and snake_case so existing links built with
  // either convention work. Same for loginHint.
  const returnTo =
    params.get("returnTo") ?? params.get("return_to") ?? undefined;
  const loginHint =
    params.get("loginHint") ?? params.get("login_hint") ?? undefined;
  const url = await getSignInUrl({ returnTo, loginHint });
  redirect(url);
}
