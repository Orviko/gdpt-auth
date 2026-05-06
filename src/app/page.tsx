import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const epicAccessToken = cookieStore.get("epicAccessToken");

  const authorizeUrl = new URL(
    `${process.env.EPIC_SANDBOX_BASE_URL}/authorize`,
  );
  authorizeUrl.searchParams.set(
    "client_id",
    process.env.EPIC_NON_PROD_CLIENT_ID!,
  );
  authorizeUrl.searchParams.set(
    "redirect_uri",
    process.env.EPIC_REDIRECT_URI || "",
  );
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", process.env.EPIC_SCOPE || "launch");
  authorizeUrl.searchParams.set("state", "demo");
  authorizeUrl.searchParams.set(
    "aud",
    "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 font-sans">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Good Patient</CardTitle>
          <CardDescription>
            Connect to Epic to view patient records
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {epicAccessToken ? (
            <Link href="/patient" className={buttonVariants()}>
              View Patient Record
            </Link>
          ) : (
            <a href={authorizeUrl.toString()} className={buttonVariants()}>
              Sign in with Epic Sandbox
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
