type KmsServiceErrorReason = "apiCallFailed" | "unknown";

export type KmsServiceError = {
  tag: "kmsServiceFailed";
  reason: KmsServiceErrorReason;
  error: unknown;
};

export const toKmsServiceError = ({
  error,
  reason,
}: {
  error: unknown;
  reason: KmsServiceErrorReason;
}): KmsServiceError => ({
  tag: "kmsServiceFailed",
  reason,
  error,
});
