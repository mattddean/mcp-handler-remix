import { createHash } from "crypto";

export function verifyCodeChallenge(
  codeVerifier: string,
  codeChallenge: string,
  method: string
): boolean {
  if (method !== "S256") {
    return false;
  }

  // Calculate the challenge from the verifier
  const calculated = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return calculated === codeChallenge;
}
