"use client";

import { FhirError } from "@/components/patient/fhir-error";
import { PageSkeleton } from "@/components/patient/page-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFhir } from "@/hooks/use-fhir";
import type { FhirPatient } from "@/types/fhir";

function formatPatientName(patient: FhirPatient): string {
  const n = patient.name?.[0];
  if (!n) return "\u2014";
  if (n.text?.trim()) return n.text.trim();
  const parts = [...(n.given ?? []), n.family].filter(Boolean);
  return parts.join(" ") || "\u2014";
}

export default function PatientProfile({
  accessToken,
}: {
  accessToken: string;
}) {
  const { data: patient, error, isLoading } = useFhir<FhirPatient>("patient");

  if (isLoading) return <PageSkeleton rows={4} />;

  if (error) {
    return (
      <FhirError
        title="Error loading patient"
        status={error.status}
        detail={error.detail}
      />
    );
  }

  if (!patient) return null;

  const displayName = formatPatientName(patient);
  const phone = patient.telecom?.find((t) => t.system === "phone")?.value;
  const email = patient.telecom?.find((t) => t.system === "email")?.value;
  const addr = patient.address?.[0];
  const addressLine = addr?.line?.filter(Boolean).join(", ");
  const cityStateZip = [addr?.city, addr?.state, addr?.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{displayName}</CardTitle>
        <CardDescription className="font-mono text-xs">
          Patient ID: {patient.id}
        </CardDescription>
        <CardDescription className="font-mono text-xs">
          Access Token: {accessToken}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {patient.gender && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Gender
              </dt>
              <dd className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {patient.gender}
                </Badge>
              </dd>
            </div>
          )}

          {patient.birthDate && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Date of Birth
              </dt>
              <dd className="mt-1 text-sm">{patient.birthDate}</dd>
            </div>
          )}

          {phone && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Phone
              </dt>
              <dd className="mt-1 text-sm">{phone}</dd>
            </div>
          )}

          {email && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 text-sm">{email}</dd>
            </div>
          )}

          {patient.maritalStatus?.text && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Marital Status
              </dt>
              <dd className="mt-1 text-sm">{patient.maritalStatus.text}</dd>
            </div>
          )}

          {patient.communication && patient.communication.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Language
              </dt>
              <dd className="mt-1 text-sm">
                {patient.communication
                  .map(
                    (c) => c.language?.text ?? c.language?.coding?.[0]?.display,
                  )
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
          )}
        </dl>

        {(addressLine || cityStateZip) && (
          <>
            <Separator className="my-4" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Address
              </dt>
              <dd className="mt-1 text-sm">
                {addressLine && <span className="block">{addressLine}</span>}
                {cityStateZip && <span className="block">{cityStateZip}</span>}
              </dd>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
