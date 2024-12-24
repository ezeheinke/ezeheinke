import jwt, { JwtPayload, Secret, VerifyOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import { AuthenticationError, toAuthenticationError } from "./errors";
import * as R from "../result-pattern";
import z from "zod";

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function isTokenExpired(expirationDate: Date | undefined): boolean {
  if (!expirationDate) {
    return true;
  }

  return expirationDate < new Date();
}

export function jwtVerify<Decoded extends object | string = JwtPayload>(
  token: string,
  secretOrPublicKey: Secret,
  options?: VerifyOptions
): R.Result<AuthenticationError, Decoded> {
  try {
    const schema = z.custom<Decoded>();

    const decoded = jwt.verify(token, secretOrPublicKey, options);
    const decodedParsed = schema.safeParse(decoded);

    if (decodedParsed.success) {
      return R.toSuccess(decodedParsed.data);
    }

    return R.toFailure(
      toAuthenticationError({
        reason: "jwtError",
        error: decodedParsed.error,
      })
    );
  } catch (error) {
    return R.toFailure(
      toAuthenticationError({
        reason: "jwtError",
        error,
      })
    );
  }
}
