import { generateUserToken } from "../../../fixtures/user-token.fixture";
import * as R from "../../result-pattern";
import { DatabaseError, toDatabaseError } from "../errors";
import { UserTokenDomain } from "./types";

async function markAsUsed({
  email,
}: {
  email: string;
}): Promise<R.Result<DatabaseError, undefined>> {
  try {
    // call ORM => Update session

    return R.toSuccess(undefined);
  } catch (err) {
    return R.toFailure(toDatabaseError(err, "unknown"));
  }
}

const getUserByHashedToken = async (
  hashedToken: string
): Promise<R.Result<DatabaseError, UserTokenDomain>> => {
  try {
    // call to ORM
    const dbUserToken = generateUserToken();

    if (!dbUserToken) {
      return R.toFailure(toDatabaseError({}, "noDataFound"));
    }

    return R.toSuccess({
      email: dbUserToken.email,
      hashedToken: dbUserToken.hashedToken,
      expiresAt: dbUserToken.expiresAt,
      isDeleted: dbUserToken.deletedAt !== null,
    });
  } catch (err) {
    return R.toFailure(toDatabaseError(err, "unknown"));
  }
};

export const userToken = {
  markAsUsed,
  getUserByHashedToken,
};
