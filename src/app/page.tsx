import { cookies } from "next/headers";
export default async function Home() {
  const cookieStore = await cookies();
  const epicAccessToken = cookieStore.get("epic_access_token");

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
  authorizeUrl.searchParams.set("scope", "launch");
  authorizeUrl.searchParams.set("state", "demo");
  authorizeUrl.searchParams.set(
    "aud",
    "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
  );

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {epicAccessToken ? (
        <div>
          You are logged in
          <a
            href="/patient"
            className="px-4 py-2 bg-white text-black rounded-md cursor-pointer"
          >
            Patient
          </a>
        </div>
      ) : (
        <a
          className="px-4 py-2 bg-white text-black rounded-md cursor-pointer"
          href={authorizeUrl.toString()}
        >
          Epic Sandbox
        </a>
      )}
      <a
        className="px-4 py-2 bg-white text-black rounded-md cursor-pointer"
        href={authorizeUrl.toString()}
      >
        Epic Sandbox
      </a>
    </div>
  );
}
