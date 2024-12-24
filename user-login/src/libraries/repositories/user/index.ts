import { generateUser } from "../../../fixtures/user.fixture";
import * as R from "../../result-pattern";
import { DatabaseError, toDatabaseError } from "../errors";
import { UserDomain } from "./types";

const findUserByEmail = async (
  email: string
): Promise<R.Result<DatabaseError, UserDomain>> => {
  try {
    // call to ORM
    const dbUser = generateUser();

    if (!dbUser) {
      return R.toFailure(toDatabaseError({}, "noDataFound"));
    }

    return R.toSuccess({
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      isDeleted: dbUser.deletedAt !== null,
    });
  } catch (err) {
    return R.toFailure(toDatabaseError(err, "unknown"));
  }
};

export const user = {
  findUserByEmail,
};
