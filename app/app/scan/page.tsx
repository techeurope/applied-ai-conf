import { redirect } from "next/navigation";

export default function ScanRedirect() {
  redirect("/app/connect?mode=scanner");
}
