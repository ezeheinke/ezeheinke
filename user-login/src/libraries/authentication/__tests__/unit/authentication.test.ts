import { faker } from "@faker-js/faker";
import authentication from "@lib/authentication";
import { toDatabaseError } from "@lib/repositories/errors";
import { user } from "@lib/repositories/user";
import { userToken } from "@lib/repositories/user-token";
import * as R from "@lib/result-pattern";
import { generateUserToken } from "../../../../fixtures/user-token.fixture";
import dayjs from "dayjs";
import { hashToken } from "@lib/authentication/utils";

jest.mock("@lib/repositories/user");
jest.mock("@lib/repositories/user-token");

const mockedUserRepo = jest.mocked(user);
const mockedUserTokenRepo = jest.mocked(userToken);

describe("Authentication", () => {
  const rawToken = faker.string.alphanumeric(10);

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe("identifyAndConsumeToken", () => {
    describe("when the db fails", () => {
      it("should return appropriate failure", async () => {
        mockedUserTokenRepo.getUserByHashedToken.mockResolvedValueOnce(
          R.toFailure(
            toDatabaseError(new Error("something happened"), "unknown")
          )
        );

        const result = await authentication.identifyAndConsumeToken(rawToken);

        expect(R.isFailure(result)).toBe(true);

        // For TS to know that is a failure.
        if (result.status === "failure") {
          expect(result.error).toMatchObject({
            tag: "vendorAuthenticationError",
            reason: "prismaWrapperError",
            error: {
              tag: "databaseError",
              reason: "unknown",
              error: {
                message: "Database error",
                code: "code",
                clientVersion: "clientVersion",
              },
            },
          });
        }
      });

      describe("when there is no contact access or token has been soft deleted", () => {
        it("should return appropriate failure", async () => {
          mockedUserTokenRepo.getUserByHashedToken.mockResolvedValueOnce(
            R.toFailure(toDatabaseError({}, "noDataFound"))
          );

          const result = await authentication.identifyAndConsumeToken(rawToken);

          expect(R.isFailure(result)).toBe(true);
          if (result.status === "failure") {
            expect(result.error).toMatchObject({
              tag: "vendorAuthenticationError",
              reason: "unknownRequester",
              error: {
                tag: "databaseError",
                reason: "noDataFound",
                error: {},
              },
            });
          }
        });
      });

      describe("when the token is expired", () => {
        it("should return appropriate failure", async () => {
          const vendorAccess = generateUserToken({
            expiresAt: dayjs(new Date()).subtract(1, "hour").toDate(),
          });
          mockedUserTokenRepo.getUserByHashedToken.mockResolvedValueOnce(
            R.toSuccess({
              email: vendorAccess.email,
              hashedToken: vendorAccess.hashedToken,
              expiresAt: vendorAccess.expiresAt,
              isDeleted: !!vendorAccess.deletedAt,
            })
          );

          const result = await authentication.identifyAndConsumeToken(rawToken);
          expect(R.isFailure(result)).toBe(true);

          if (result.status === "failure") {
            expect(result.error).toMatchObject({
              tag: "vendorAuthenticationError",
              reason: "tokenExpired",
              error: {
                email: vendorAccess.email,
              },
            });
          }
        });
      });

      describe("when requester token is valid", () => {
        it("should return the email", async () => {
          const expectedEmail = faker.internet.email();
          const userToken = generateUserToken({
            email: expectedEmail,
            hashedToken: hashToken(rawToken),
          });
          mockedUserTokenRepo.getUserByHashedToken.mockResolvedValueOnce(
            R.toSuccess({
              email: userToken.email,
              hashedToken: userToken.hashedToken,
              expiresAt: userToken.expiresAt,
              isDeleted: !!userToken.deletedAt,
            })
          );

          mockedUserTokenRepo.markAsUsed.mockResolvedValueOnce(
            R.toSuccess(undefined)
          );

          const result = await authentication.identifyAndConsumeToken(rawToken);

          expect(R.isSuccess(result)).toBe(true);
          if (result.status === "success") {
            expect(result.data).toMatchObject(expectedEmail);
          }
        });
      });
    });
  });
});
