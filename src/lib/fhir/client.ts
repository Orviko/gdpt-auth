import "server-only";

import { cookies } from "next/headers";

// ---- Result types ----

type FhirSuccess<T> = { ok: true; data: T };
type FhirError = { ok: false; status: number; detail: string };

export type FhirResult<T> = FhirSuccess<T> | FhirError;

// ---- Auth credentials ----

export type AuthCredentials = {
  accessToken: string;
  patientId: string;
};

/**
 * Read the Epic access token and patient ID from httpOnly cookies.
 * Returns `null` when the user is not authenticated.
 */
export async function getAuthCredentials(): Promise<AuthCredentials | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("epicAccessToken")?.value;
  const patientId = cookieStore.get("epicPatientId")?.value;

  if (!accessToken || !patientId) return null;
  return { accessToken, patientId };
}

// ---- FHIR fetch ----

/**
 * Perform an authenticated GET request against the Epic FHIR R4 endpoint.
 *
 * Returns a discriminated union so callers can pattern-match on `ok`.
 */
export async function fhirFetch<T>(
  url: string,
  accessToken: string,
): Promise<FhirResult<T>> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/fhir+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[FHIR] ${res.status} ${url}\n${detail}`);
    return { ok: false, status: res.status, detail };
  }

  const data = (await res.json()) as T;
  return { ok: true, data };
}
