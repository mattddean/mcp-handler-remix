import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  // In production, return actual public keys used for JWT signing
  // This is a placeholder for demo purposes
  const jwks = {
    keys: [
      {
        kty: "RSA",
        use: "sig",
        kid: "demo-key-1",
        alg: "RS256",
        n: "demo-modulus", // In production: actual RSA public key modulus
        e: "AQAB", // In production: actual RSA public key exponent
      },
    ],
  };

  return json(jwks);
}
