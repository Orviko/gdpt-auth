import { cookies } from "next/headers";
import Link from "next/link";

/** Must match the `aud` used in the Epic authorize URL on the home page. */
const EPIC_FHIR_R4_BASE =
  "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4";

type HumanName = {
  text?: string;
  family?: string;
  given?: string[];
};

type FhirPatient = {
  resourceType: "Patient";
  id: string;
  name?: HumanName[];
  birthDate?: string;
  gender?: string;
  telecom?: { system?: string; value?: string }[];
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
  }[];
};

function formatPatientName(patient: FhirPatient): string {
  const n = patient.name?.[0];
  if (!n) return "—";
  if (n.text?.trim()) return n.text.trim();
  const parts = [...(n.given ?? []), n.family].filter(Boolean);
  return parts.join(" ") || "—";
}

export default async function PatientPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("epicAccessToken")?.value;
  const patientId = cookieStore.get("epicPatientId")?.value;

  if (!accessToken || !patientId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
        <p className="text-zinc-700 dark:text-zinc-300">
          Sign in with Epic Sandbox to load your patient record.
        </p>
        <Link
          href="/"
          className="rounded-md bg-white px-4 py-2 text-black dark:bg-zinc-800 dark:text-white"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const url = `${EPIC_FHIR_R4_BASE}/Patient/${patientId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/fhir+json",
    },
    cache: "no-store",
  });

  console.log("res:", res);

  if (!res.ok) {
    const detail = await res.text();
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
        <p className="text-center text-red-600 dark:text-red-400">
          Could not load patient ({res.status}).
        </p>
        <pre className="max-h-48 max-w-full overflow-auto rounded border border-zinc-200 bg-white p-3 text-left text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          {detail}
        </pre>
        <Link
          href="/"
          className="rounded-md bg-white px-4 py-2 text-black dark:bg-zinc-800 dark:text-white"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const patient = (await res.json()) as FhirPatient;
  const displayName = formatPatientName(patient);
  const phone = patient.telecom?.find((t) => t.system === "phone")?.value;
  const addr = patient.address?.[0];
  const addressLine = addr?.line?.filter(Boolean).join(", ");
  const cityStateZip = [addr?.city, addr?.state, addr?.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Patient
        </h1>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Name
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {displayName}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Patient ID
            </dt>
            <dd className="mt-1 font-mono text-xs text-zinc-800 dark:text-zinc-200">
              {patient.id}
            </dd>
          </div>
          {patient.gender && (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Gender
              </dt>
              <dd className="mt-1 capitalize text-zinc-900 dark:text-zinc-100">
                {patient.gender}
              </dd>
            </div>
          )}
          {patient.birthDate && (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Birth date
              </dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                {patient.birthDate}
              </dd>
            </div>
          )}
          {phone && (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Phone
              </dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{phone}</dd>
            </div>
          )}
          {(addressLine || cityStateZip) && (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Address
              </dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                {[addressLine, cityStateZip].filter(Boolean).join("\n")}
              </dd>
            </div>
          )}
        </dl>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
