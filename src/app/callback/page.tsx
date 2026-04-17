"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CallbackContent() {
  const [message, setMessage] = useState<string>("");
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!code) {
        return;
      }
      console.log(code);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/epic/sandbox/token`,
        {
          method: "POST",
          body: JSON.stringify({
            code,
          }),
        },
      );

      const data = await response.json();
      setMessage(data.message);
      if (data.data?.token) {
        localStorage.setItem("epic_access_token", data.data.token);
        localStorage.setItem(
          "epic_expires_in",
          data.data.expires_in.toString(),
        );
        localStorage.setItem("epic_scope", data.data.scope);
        localStorage.setItem("epic_patient", data.data.patient);
      }
    }, 5);

    // wait for 2 sec and redirect to home

    return () => clearTimeout(timeout);
  }, [code]);

  return (
    <div>
      <h1>Callback</h1>
      <p>Code: {code}</p>
      {error && <p>Error: {error}</p>}
      {message && (
        <h2 className="text-green-600 font-bold text-2xl">
          Message: {message}
        </h2>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
