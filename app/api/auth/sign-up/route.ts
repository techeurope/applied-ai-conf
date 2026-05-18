import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const returnTo = new URL(request.url).searchParams.get("returnTo") ?? undefined;
  const url = await getSignUpUrl({ returnTo });
  redirect(url);
}
