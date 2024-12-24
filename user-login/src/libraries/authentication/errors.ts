type AuthenticationErrorReason =
  | "unknown"
  | "databaseError"
  | "tokenExpired"
  | "apiFailed"
  | "jwtError"
  | "unknownRequester";

export type AuthenticationError = {
  tag: "authenticationFailed";
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
  tag: "authenticationFailed",
  reason,
  error,
});
