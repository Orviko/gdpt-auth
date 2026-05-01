import { getAuthCredentials, fhirFetch } from "@/lib/fhir/client";
import { FHIR_ENDPOINTS } from "@/lib/fhir/constants";
import type { FhirBundle, FhirMedicationRequest } from "@/types/fhir";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { FhirError } from "@/components/patient/fhir-error";

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

export default async function MedicationsPage() {
  const auth = await getAuthCredentials();
  if (!auth) return null;

  const result = await fhirFetch<FhirBundle<FhirMedicationRequest>>(
    FHIR_ENDPOINTS.medications(auth.patientId),
    auth.accessToken,
  );

  if (!result.ok) {
    return (
      <FhirError
        title="Error loading medications"
        status={result.status}
        detail={result.detail}
      />
    );
  }

  const medications = result.data.entry?.map((e) => e.resource) ?? [];

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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Prescriber</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  {getMedicationName(m)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(m.status)}>
                    {m.status ?? "unknown"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-48 text-sm text-muted-foreground">
                  {m.dosageInstruction?.[0]?.text ?? "\u2014"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {m.requester?.display ?? "\u2014"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {m.authoredOn ?? "\u2014"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
