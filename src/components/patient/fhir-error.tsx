import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  RefreshCw,
  ServerCrash,
  ShieldX,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

function getErrorInfo(status: number) {
  switch (status) {
    case 401:
      return {
        icon: ShieldX,
        label: "Unauthorized",
        heading: "Session Expired",
        description:
          "Your authentication session has expired. Please sign in again to continue.",
        showReauth: true,
      };
    case 403:
      return {
        icon: ShieldX,
        label: "Forbidden",
        heading: "Access Denied",
        description:
          "Your app does not have permission to access this resource. Make sure the corresponding FHIR Search API is enabled in your Epic developer app settings.",
        showReauth: true,
      };
    case 404:
      return {
        icon: TriangleAlert,
        label: "Not Found",
        heading: "No Data Available",
        description:
          "This resource was not found for the current patient. The data may not exist in the system.",
        showReauth: false,
      };
    default:
      return {
        icon: ServerCrash,
        label: `Error ${status}`,
        heading: "Something Went Wrong",
        description:
          "An unexpected error occurred while loading this resource. Please try again later.",
        showReauth: false,
      };
  }
}

export function FhirError({
  title,
  status,
  detail,
}: {
  title: string;
  status: number;
  detail: string;
}) {
  const info = getErrorInfo(status);
  const Icon = info.icon;

  // Try to parse FHIR OperationOutcome for a readable message
  let diagnosticMessage = "";
  try {
    const parsed = JSON.parse(detail);
    diagnosticMessage =
      parsed?.issue?.[0]?.diagnostics ??
      parsed?.issue?.[0]?.details?.text ??
      parsed?.error_description ??
      parsed?.error ??
      "";
  } catch {
    diagnosticMessage = detail || "";
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-xl border bg-card px-8 py-12  ">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/5">
        <Icon className="h-8 w-8 text-destructive" />
      </div>

      {/* Heading + badge */}
      <h2 className="mt-5 text-xl font-semibold tracking-tight">
        {info.heading}
      </h2>
      <Badge
        variant="outline"
        className="mt-2 border-destructive/30 text-destructive"
      >
        {info.label} &middot; {status}
      </Badge>

      {/* Description */}
      <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        {info.description}
      </p>

      {/* Diagnostics */}
      {diagnosticMessage && (
        <div className="mt-5 w-full max-w-md">
          <Separator className="mb-4" />
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            Diagnostic details
          </p>
          <pre className="max-h-28 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {diagnosticMessage}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center gap-3">
        {info.showReauth && (
          <Link
            href="/"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-authenticate
          </Link>
        )}
        <Link
          href="/patient"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Profile
        </Link>
      </div>
    </div>
  );
}
