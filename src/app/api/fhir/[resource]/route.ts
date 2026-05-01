import { FHIR_ENDPOINTS } from "@/lib/fhir/constants";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const RESOURCE_MAP: Record<string, (patientId: string) => string> = {
  patient: (id) => FHIR_ENDPOINTS.patient(id),
  conditions: (id) => FHIR_ENDPOINTS.conditions(id),
  allergies: (id) => FHIR_ENDPOINTS.allergies(id),
  medications: (id) => FHIR_ENDPOINTS.medications(id),
  observations: (id) => FHIR_ENDPOINTS.observations(id),
  immunizations: (id) => FHIR_ENDPOINTS.immunizations(id),
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;

  const buildUrl = RESOURCE_MAP[resource];
  if (!buildUrl) {
    return Response.json(
      { error: `Unknown resource: ${resource}` },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("epicAccessToken")?.value;
  const patientId = cookieStore.get("epicPatientId")?.value;

  if (!accessToken || !patientId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const fhirUrl = buildUrl(patientId);

  const fhirRes = await fetch(fhirUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/fhir+json",
    },
    cache: "no-store",
  });

  const body = await fhirRes.text();

  return new Response(body, {
    status: fhirRes.status,
    headers: { "Content-Type": "application/fhir+json" },
  });
}
