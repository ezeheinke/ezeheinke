type DatabaseErrorReason = "unknown" | "noDataFound";

export type DatabaseError = {
  tag: "databaseError";
  reason: DatabaseErrorReason;
  error: unknown;
};

export const toDatabaseError = (
  originalError: unknown,
  reason: DatabaseErrorReason = "unknown"
): DatabaseError => ({
  tag: "databaseError",
  reason,
  error: originalError,
});
