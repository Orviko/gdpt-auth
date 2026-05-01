"use client";

import { useFhir } from "@/hooks/use-fhir";
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
import { Info } from "lucide-react";
import { FhirError } from "@/components/patient/fhir-error";
import { PageSkeleton } from "@/components/patient/page-skeleton";

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

function getCodeableText(concept?: {
  coding?: { display?: string }[];
  text?: string;
}): string {
  return concept?.text ?? concept?.coding?.[0]?.display ?? "\u2014";
}

export default function ImmunizationsPage() {
  const {
    data: bundle,
    error,
    isLoading,
  } = useFhir<FhirBundle<FhirImmunization>>("immunizations");

  if (isLoading) return <PageSkeleton rows={4} />;

  if (error) {
    return (
      <FhirError
        title="Error loading immunizations"
        status={error.status}
        detail={error.detail}
      />
    );
  }

  const immunizations = bundle?.entry?.map((e) => e.resource) ?? [];

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
