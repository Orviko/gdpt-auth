/** Must match the `aud` used in the Epic authorize URL on the home page. */
export const FHIR_BASE_URL =
  "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4";

export const FHIR_ENDPOINTS = {
  patient: (id: string) => `${FHIR_BASE_URL}/Patient/${id}`,

  conditions: (patientId: string) =>
    `${FHIR_BASE_URL}/Condition?patient=${patientId}`,

  allergies: (patientId: string) =>
    `${FHIR_BASE_URL}/AllergyIntolerance?patient=${patientId}`,

  medications: (patientId: string) =>
    `${FHIR_BASE_URL}/MedicationRequest?patient=${patientId}`,

  observations: (patientId: string, category = "vital-signs") =>
    `${FHIR_BASE_URL}/Observation?patient=${patientId}&category=${category}`,

  immunizations: (patientId: string) =>
    `${FHIR_BASE_URL}/Immunization?patient=${patientId}`,
} as const;
