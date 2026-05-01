import { getAuthCredentials, fhirFetch } from "@/lib/fhir/client";
import { FHIR_ENDPOINTS } from "@/lib/fhir/constants";
import type { FhirBundle, FhirObservation } from "@/types/fhir";
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

function interpretationVariant(
  code?: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (code) {
    case "N":
    case "normal":
      return "secondary";
    case "H":
    case "HH":
    case "high":
      return "destructive";
    case "L":
    case "LL":
    case "low":
      return "outline";
    case "A":
    case "AA":
    case "abnormal":
      return "destructive";
    default:
      return "default";
  }
}

function getCodeableText(concept?: { coding?: { display?: string }[]; text?: string }): string {
  return concept?.text ?? concept?.coding?.[0]?.display ?? "\u2014";
}

function formatObservationValue(obs: FhirObservation): string {
  // Simple value
  if (obs.valueQuantity?.value != null) {
    return `${obs.valueQuantity.value} ${obs.valueQuantity.unit ?? ""}`.trim();
  }
  if (obs.valueString) return obs.valueString;
  if (obs.valueCodeableConcept) return getCodeableText(obs.valueCodeableConcept);

  // Multi-component (e.g. blood pressure with systolic/diastolic)
  if (obs.component && obs.component.length > 0) {
    return obs.component
      .map((c) => {
        const label = getCodeableText(c.code);
        const val =
          c.valueQuantity?.value != null
            ? `${c.valueQuantity.value} ${c.valueQuantity.unit ?? ""}`.trim()
            : c.valueString ?? "";
        return `${label}: ${val}`;
      })
      .join(" / ");
  }

  return "\u2014";
}

export default async function ObservationsPage() {
  const auth = await getAuthCredentials();
  if (!auth) return null;

  const result = await fhirFetch<FhirBundle<FhirObservation>>(
    FHIR_ENDPOINTS.observations(auth.patientId),
    auth.accessToken,
  );

  if (!result.ok) {
    return (
      <FhirError
        title="Error loading observations"
        status={result.status}
        detail={result.detail}
      />
    );
  }

  const observations = result.data.entry?.map((e) => e.resource) ?? [];

  if (observations.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No observations recorded</AlertTitle>
        <AlertDescription>
          No vital signs or observations were found for this patient.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitals &amp; Observations</CardTitle>
        <CardDescription>
          {observations.length} observation
          {observations.length !== 1 ? "s" : ""} on record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Observation</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Interpretation</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {observations.map((o) => {
              const interpCode =
                o.interpretation?.[0]?.coding?.[0]?.code;
              const interpDisplay =
                o.interpretation?.[0]?.text ??
                o.interpretation?.[0]?.coding?.[0]?.display;

              return (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    {getCodeableText(o.code)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatObservationValue(o)}
                  </TableCell>
                  <TableCell>
                    {interpDisplay ? (
                      <Badge variant={interpretationVariant(interpCode)}>
                        {interpDisplay}
                      </Badge>
                    ) : (
                      "\u2014"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.effectiveDateTime ?? "\u2014"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.status ?? "unknown"}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
