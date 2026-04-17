import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code || typeof code !== "string") {
    return Response.json(
      { message: "Missing authorization code" },
      { status: 400 },
    );
  }

  const tokenEndpoint = `${process.env.EPIC_SANDBOX_BASE_URL}/token`;
  const clientId = process.env.EPIC_NON_PROD_CLIENT_ID;
  const redirectUri = process.env.EPIC_REDIRECT_URI;

  if (!tokenEndpoint || !clientId) {
    return Response.json(
      { message: "Server misconfiguration: missing Epic env vars" },
      { status: 500 },
    );
  }

  console.log({
    code,
    tokenEndpoint,
    clientId,
    redirectUri,
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri || "",
      client_id: clientId,
    }),
  };

  const epicResponse = await fetch(tokenEndpoint, options);
  const tokenData = await epicResponse.json();

  console.log("epicResponse:", tokenData);

  if (!epicResponse.ok) {
    return Response.json(
      { message: "Token exchange failed", detail: tokenData },
      { status: epicResponse.status },
    );
  }

  const cookieStore = await cookies();
  const maxAge = tokenData.expires_in ?? 3600;
  cookieStore.set({
    name: "epicAccessToken",
    value: tokenData.access_token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
  cookieStore.set({
    name: "epicPatientId",
    value: tokenData.patient,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  return Response.json({
    message: "Token exchange successful",
    data: {
      token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      patient: tokenData.patient,
    },
  });
}
