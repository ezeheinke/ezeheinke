import kmsService from "../../providers/kms-service";

import { user, userToken } from "@lib/repositories/index";
import { AuthenticationError, toAuthenticationError } from "./errors";
import { hashToken, isTokenExpired, jwtVerify } from "./utils";
import { serialize } from "cookie";

import * as R from "../result-pattern";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SOME_APP_COOKIE_NAME, TOKEN_TTL } from "../constants";
import { UserDomain } from "@lib/repositories/user/types";

interface UserAuthentication {
  identifyAndConsumeToken(
    rawToken: string
  ): Promise<R.Result<AuthenticationError, string>>;
  getJwtCookie(
    userEmail: string
  ): Promise<R.Result<AuthenticationError, string>>;
  verifyJwtCookie(
    cookie: string
  ): Promise<R.Result<AuthenticationError, JwtPayload>>;
  getAuthenticatedUserEmail(
    token: string
  ): Promise<R.Result<AuthenticationError, UserDomain>>;
}

const identifyAndConsumeToken: UserAuthentication["identifyAndConsumeToken"] =
  async (rawRequesterToken) => {
    try {
      const hashedToken = hashToken(rawRequesterToken);
      const getUserByHashedTokenResult = await userToken.getUserByHashedToken(
        hashedToken
      );
      if (R.isFailure(getUserByHashedTokenResult)) {
        return R.toFailure(
          toAuthenticationError({
            reason: "databaseError",
            error: getUserByHashedTokenResult.error,
          })
        );
      }

      const registeredUser = getUserByHashedTokenResult.data;

      if (isTokenExpired(registeredUser.expiresAt ?? undefined)) {
        return R.toFailure(
          toAuthenticationError({
            reason: "tokenExpired",
            error: { email: registeredUser.email },
          })
        );
      }

      const markAsUsedResult = await userToken.markAsUsed({
        email: registeredUser.email,
      });
      if (R.isFailure(markAsUsedResult)) {
        return R.toFailure(
          toAuthenticationError({
            reason: "databaseError",
            error: markAsUsedResult.error,
          })
        );
      }

      return R.toSuccess(registeredUser.email);
    } catch (error) {
      return R.toFailure(toAuthenticationError({ reason: "unknown", error }));
    }
  };

const getJwtCookie: UserAuthentication["getJwtCookie"] = async (userEmail) => {
  const secretKey = await kmsService.getSecretKey();
  if (R.isFailure(secretKey)) {
    return R.toFailure(
      toAuthenticationError({
        reason: "apiFailed",
        error: secretKey.error,
      })
    );
  }

  try {
    const jwtToken = jwt.sign({ email: userEmail }, secretKey.data, {
      algorithm: "HS256",
      expiresIn: TOKEN_TTL,
    });

    const cookie = serialize(SOME_APP_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // make it available in local
      sameSite: "lax",
      maxAge: TOKEN_TTL,
      path: "/",
    });

    return R.toSuccess(cookie);
  } catch (error) {
    return R.toFailure(
      toAuthenticationError({
        reason: "jwtError",
        error,
      })
    );
  }
};

const verifyJwtCookie: UserAuthentication["verifyJwtCookie"] = async (
  cookie
) => {
  const secretKey = await kmsService.getSecretKey();
  if (R.isFailure(secretKey)) {
    return R.toFailure(
      toAuthenticationError({
        reason: "apiFailed",
        error: secretKey.error,
      })
    );
  }

  return jwtVerify<JwtPayload>(cookie, secretKey.data);
};

const getAuthenticatedUserEmail: UserAuthentication["getAuthenticatedUserEmail"] =
  async (token) => {
    const verifyJwtCookieResult = await userAuthentication.verifyJwtCookie(
      token
    );

    if (R.isFailure(verifyJwtCookieResult)) {
      return R.toFailure(
        toAuthenticationError({
          reason: "jwtError",
          error: verifyJwtCookieResult.error,
        })
      );
    }

    const { email } = verifyJwtCookieResult.data;
    const findUserByEmailResult = await user.findUserByEmail(email);

    if (R.isFailure(findUserByEmailResult)) {
      return R.toFailure(
        toAuthenticationError({
          reason: "databaseError",
          error: findUserByEmailResult.error,
        })
      );
    }

    const authenticatedUser = findUserByEmailResult.data;

    if (!authenticatedUser) {
      return R.toFailure(
        toAuthenticationError({
          reason: "unknownRequester",
          error: {
            email,
          },
        })
      );
    }

    return R.toSuccess(authenticatedUser);
  };

const userAuthentication: UserAuthentication = {
  identifyAndConsumeToken,
  getJwtCookie,
  verifyJwtCookie,
  getAuthenticatedUserEmail,
};

export default userAuthentication;
