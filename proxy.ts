import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logos/|speakers/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map|woff|woff2|ttf|json)$).*)",
  ],
};
