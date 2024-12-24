type AuthenticationErrorReason =
  | "unknown"
  | "databaseError"
  | "tokenExpired"
  | "apiFailed"
  | "jwtError"
  | "unknownRequester";

export type AuthenticationError = {
  tag: "AuthenticationFailed";
  reason: AuthenticationErrorReason;
  error: unknown;
};

export const toAuthenticationError = ({
  error,
  reason,
}: {
  error: unknown;
  reason: AuthenticationErrorReason;
}): AuthenticationError => ({
  tag: "AuthenticationFailed",
  reason,
  error,
});
