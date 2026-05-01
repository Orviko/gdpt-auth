"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

function CallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code received.");
      return;
    }

    let cancelled = false;

    async function exchangeToken() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/epic/sandbox/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          },
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setStatus("error");
          setMessage(data.message ?? "Token exchange failed");
          return;
        }

        setStatus("success");
        setMessage("Authenticated successfully. Redirecting...");

        // Redirect to patient page after brief delay
        setTimeout(() => {
          if (!cancelled) router.push("/patient");
        }, 1000);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error during token exchange.");
        }
      }
    }

    exchangeToken();

    return () => {
      cancelled = true;
    };
  }, [code, error, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Connecting to Epic Sandbox</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Exchanging authorization code...</span>
            </div>
          )}

          {status === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
