import { getAuthCredentials, fhirFetch } from "@/lib/fhir/client";
import { FHIR_ENDPOINTS } from "@/lib/fhir/constants";
import type { FhirBundle, FhirImmunization } from "@/types/fhir";
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
    case "completed":
      return "default";
    case "not-done":
      return "destructive";
    case "entered-in-error":
      return "outline";
    default:
      return "secondary";
  }
}

function getCodeableText(concept?: { coding?: { display?: string }[]; text?: string }): string {
  return concept?.text ?? concept?.coding?.[0]?.display ?? "\u2014";
}

export default async function ImmunizationsPage() {
  const auth = await getAuthCredentials();
  if (!auth) return null;

  const result = await fhirFetch<FhirBundle<FhirImmunization>>(
    FHIR_ENDPOINTS.immunizations(auth.patientId),
    auth.accessToken,
  );

  if (!result.ok) {
    return (
      <FhirError
        title="Error loading immunizations"
        status={result.status}
        detail={result.detail}
      />
    );
  }

  const immunizations = result.data.entry?.map((e) => e.resource) ?? [];

  if (immunizations.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No immunization records</AlertTitle>
        <AlertDescription>
          No immunization history was found for this patient.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Immunization History</CardTitle>
        <CardDescription>
          {immunizations.length} immunization
          {immunizations.length !== 1 ? "s" : ""} on record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaccine</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lot Number</TableHead>
              <TableHead>Site</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {immunizations.map((imm) => (
              <TableRow key={imm.id}>
                <TableCell className="font-medium">
                  {getCodeableText(imm.vaccineCode)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {imm.occurrenceDateTime ?? imm.occurrenceString ?? "\u2014"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(imm.status)}>
                    {imm.status ?? "unknown"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {imm.lotNumber ?? "\u2014"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getCodeableText(imm.site)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
