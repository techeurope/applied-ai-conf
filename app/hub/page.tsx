import { redirect } from "next/navigation";

// /hub now lives at /app. Keep this redirect around so any printed badges,
// links shared internally, or QR codes pointing at /hub still land somewhere
// sensible.
export default function HubRedirect() {
  redirect("/app");
}
