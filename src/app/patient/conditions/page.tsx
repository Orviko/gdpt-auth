"use client";

import { useFhir } from "@/hooks/use-fhir";
import { getBundleResources } from "@/lib/fhir/bundle";
import type { FhirBundle, FhirCondition } from "@/types/fhir";
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
import { Info } from "lucide-react";
import { FhirError } from "@/components/patient/fhir-error";
import { PageSkeleton } from "@/components/patient/page-skeleton";

function clinicalStatusVariant(
  status?: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "destructive";
    case "resolved":
      return "secondary";
    case "inactive":
      return "outline";
    default:
      return "default";
  }
}

function getCodeableText(concept?: {
  coding?: { display?: string }[];
  text?: string;
}): string {
  return concept?.text ?? concept?.coding?.[0]?.display ?? "\u2014";
}

export default function ConditionsPage() {
  const {
    data: bundle,
    error,
    isLoading,
  } = useFhir<FhirBundle<FhirCondition>>("conditions");

  if (isLoading) return <PageSkeleton rows={5} />;

  if (error) {
    return (
      <FhirError
        title="Error loading conditions"
        status={error.status}
        detail={error.detail}
      />
    );
  }

  const conditions = getBundleResources(bundle);

  if (conditions.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No conditions on record</AlertTitle>
        <AlertDescription>
          No diagnoses or conditions were found for this patient.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditions &amp; Diagnoses</CardTitle>
        <CardDescription>
          {conditions.length} condition{conditions.length !== 1 ? "s" : ""} on
          record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Condition</TableHead>
              <TableHead>Clinical Status</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Onset Date</TableHead>
              <TableHead>Recorded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conditions.map((c) => {
              const status =
                c.clinicalStatus?.coding?.[0]?.code ?? "unknown";
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {getCodeableText(c.code)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={clinicalStatusVariant(status)}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>{getCodeableText(c.severity)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.onsetDateTime ?? "\u2014"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.recordedDate ?? "\u2014"}
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
