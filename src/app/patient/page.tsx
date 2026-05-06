import PatientProfile from "@/components/patient/Profile";
import { cookies } from "next/headers";

export default async function PatientPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("epicAccessToken")?.value || "";

  return <PatientProfile accessToken={accessToken} />;
}
