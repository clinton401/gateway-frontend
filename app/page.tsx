import { getServerUser } from "@/lib/get-server-user";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  redirect("/overview");
}
