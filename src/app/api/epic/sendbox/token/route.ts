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

  console.log(epicResponse);

  if (!epicResponse.ok) {
    const errorText = await epicResponse.text();
    return Response.json(
      { message: "Token exchange failed", detail: errorText },
      { status: epicResponse.status },
    );
  }

  const tokenData = await epicResponse.json();

  console.log(tokenData);

  // // Persist the access token in an httpOnly cookie so client JS cannot read it
  // const cookieStore = await cookies();
  // cookieStore.set("epic_access_token", tokenData.access_token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   // Honour the expiry Epic sends back (in seconds); fall back to 1 hour
  //   maxAge: tokenData.expires_in ?? 3600,
  //   path: "/",
  // });

  // if (tokenData.refresh_token) {
  //   cookieStore.set("epic_refresh_token", tokenData.refresh_token, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "lax",
  //     maxAge: 60 * 60 * 24 * 30, // 30 days
  //     path: "/",
  //   });
  // }

  // // Return non-sensitive metadata to the client
  // return Response.json({
  //   token_type: tokenData.token_type,
  //   expires_in: tokenData.expires_in,
  //   scope: tokenData.scope,
  //   patient: tokenData.patient,
  // });

  const cookieStore = await cookies();
  cookieStore.set({
    name: "epic_access_token",
    value: tokenData.access_token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokenData.expires_in ?? 3600,
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
