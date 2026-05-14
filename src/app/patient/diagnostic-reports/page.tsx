"use client";

import { useFhir } from "@/hooks/use-fhir";
import { getBundleResources } from "@/lib/fhir/bundle";
import type { FhirBundle, FhirDiagnosticReport } from "@/types/fhir";
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
  status?: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "final":
      return "default";
    case "preliminary":
      return "secondary";
    case "cancelled":
    case "entered-in-error":
      return "destructive";
    case "registered":
    case "partial":
      return "outline";
    default:
      return "outline";
  }
}

function getCodeableText(concept?: {
  coding?: { display?: string }[];
  text?: string;
}): string {
  return concept?.text ?? concept?.coding?.[0]?.display ?? "\u2014";
}

function formatCategories(
  categories?: { text?: string; coding?: { display?: string }[] }[],
): string {
  if (!categories || categories.length === 0) return "\u2014";
  return (
    categories
      .map((c) => c.text ?? c.coding?.[0]?.display)
      .filter(Boolean)
      .join(", ") || "\u2014"
  );
}

export default function DiagnosticReportsPage() {
  const {
    data: bundle,
    error,
    isLoading,
  } = useFhir<FhirBundle<FhirDiagnosticReport>>("diagnostic-reports");

  if (isLoading) return <PageSkeleton rows={5} />;

  if (error) {
    return (
      <FhirError
        title="Error loading diagnostic reports"
        status={error.status}
        detail={error.detail}
      />
    );
  }

  const reports = getBundleResources(bundle);

  if (reports.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No diagnostic reports</AlertTitle>
        <AlertDescription>
          No diagnostic reports were found for this patient.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnostic Reports</CardTitle>
        <CardDescription>
          {reports.length} report{reports.length !== 1 ? "s" : ""} on record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Performer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {getCodeableText(r.code)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatCategories(r.category)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status)}>
                    {r.status ?? "unknown"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.effectiveDateTime ??
                    r.effectivePeriod?.start ??
                    r.issued ??
                    "\u2014"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.performer
                    ?.map((p) => p.display)
                    .filter(Boolean)
                    .join(", ") || "\u2014"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
