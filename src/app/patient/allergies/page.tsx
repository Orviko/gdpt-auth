"use client";

import { useFhir } from "@/hooks/use-fhir";
import { getBundleResources } from "@/lib/fhir/bundle";
import type { FhirAllergyIntolerance, FhirBundle } from "@/types/fhir";
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

function criticalityVariant(
  c?: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (c) {
    case "high":
      return "destructive";
    case "low":
      return "secondary";
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

export default function AllergiesPage() {
  const {
    data: bundle,
    error,
    isLoading,
  } = useFhir<FhirBundle<FhirAllergyIntolerance>>("allergies");

  if (isLoading) return <PageSkeleton rows={4} />;

  if (error) {
    return (
      <FhirError
        title="Error loading allergies"
        status={error.status}
        detail={error.detail}
      />
    );
  }

  const allergies = getBundleResources(bundle);

  if (allergies.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No known allergies</AlertTitle>
        <AlertDescription>
          No allergies or intolerances were found for this patient.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allergies &amp; Intolerances</CardTitle>
        <CardDescription>
          {allergies.length} allerg{allergies.length !== 1 ? "ies" : "y"} on
          record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Allergen</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Criticality</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reactions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allergies.map((a) => {
              const status =
                a.clinicalStatus?.coding?.[0]?.code ?? "unknown";
              const reactions = a.reaction
                ?.flatMap(
                  (r) =>
                    r.manifestation?.map(
                      (m) => m.text ?? m.coding?.[0]?.display,
                    ) ?? [],
                )
                .filter(Boolean);

              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {getCodeableText(a.code)}
                  </TableCell>
                  <TableCell>
                    {a.category?.map((cat) => (
                      <Badge key={cat} variant="outline" className="mr-1">
                        {cat}
                      </Badge>
                    )) ?? "\u2014"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={criticalityVariant(a.criticality)}>
                      {a.criticality ?? "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-48 text-sm text-muted-foreground">
                    {reactions && reactions.length > 0
                      ? reactions.join(", ")
                      : "\u2014"}
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
