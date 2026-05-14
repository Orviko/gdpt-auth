import type { FhirBundle } from "@/types/fhir";

/**
 * Extract resources from a FHIR Bundle, filtering out OperationOutcome
 * entries (search.mode === "outcome") that Epic includes as metadata.
 */
export function getBundleResources<T extends { resourceType: string }>(
  bundle: FhirBundle<T> | null | undefined,
): T[] {
  if (!bundle?.entry) return [];

  return bundle.entry
    .filter(
      (e) =>
        e.search?.mode !== "outcome" &&
        e.resource?.resourceType !== "OperationOutcome",
    )
    .map((e) => e.resource as T);
}
