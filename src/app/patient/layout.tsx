import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PatientNav } from "@/components/patient/patient-nav";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("epicAccessToken")?.value;
  const patientId = cookieStore.get("epicPatientId")?.value;

  if (!accessToken || !patientId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PatientNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
