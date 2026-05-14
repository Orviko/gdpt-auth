"use client";

import { useFhir } from "@/hooks/use-fhir";
import { getBundleResources } from "@/lib/fhir/bundle";
import type { FhirBundle, FhirMedicationRequest } from "@/types/fhir";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Pill } from "lucide-react";
import { FhirError } from "@/components/patient/fhir-error";
import { PageSkeleton } from "@/components/patient/page-skeleton";

function statusVariant(
  s?: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "active":
      return "default";
    case "completed":
      return "secondary";
    case "stopped":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function getMedicationName(med: FhirMedicationRequest): string {
  return (
    med.medicationCodeableConcept?.text ??
    med.medicationCodeableConcept?.coding?.[0]?.display ??
    med.medicationReference?.display ??
    "\u2014"
  );
}

export default function MedicationsPage() {
  const {
    data: bundle,
    error,
    isLoading,
  } = useFhir<FhirBundle<FhirMedicationRequest>>("medications");

  if (isLoading) return <PageSkeleton rows={5} />;

  if (error) {
    return (
      <FhirError
        title="Error loading medications"
        status={error.status}
        detail={error.detail}
      />
    );
  }

  const medications = getBundleResources(bundle);

  if (medications.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No medications on record</AlertTitle>
        <AlertDescription>
          No medication requests were found for this patient.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medications</CardTitle>
        <CardDescription>
          {medications.length} medication{medications.length !== 1 ? "s" : ""}{" "}
          on record
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {medications.map((m, i) => (
          <div key={m.id}>
            {i > 0 && <Separator className="mb-4" />}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Pill className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium leading-snug">
                    {getMedicationName(m)}
                  </p>
                  <Badge variant={statusVariant(m.status)}>
                    {m.status ?? "unknown"}
                  </Badge>
                </div>

                {m.dosageInstruction?.[0]?.text && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {m.dosageInstruction[0].text}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {m.requester?.display && (
                    <span>Prescriber: {m.requester.display}</span>
                  )}
                  {m.authoredOn && <span>Date: {m.authoredOn}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
