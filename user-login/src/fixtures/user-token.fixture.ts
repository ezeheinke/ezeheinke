import {
  UserTokenDb,
  UserTokenDomain,
} from "@lib/repositories/user-token/types";
import { PartialGeneratorFn } from "./utils";
import { faker } from "@faker-js/faker";

export const generateUserToken: PartialGeneratorFn<UserTokenDb> = (
  override
) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  hashedToken: faker.string.alphanumeric(20),
  expiresAt: faker.date.future(),
  createdAt: faker.date.past(),
  deletedAt: null,
  ...override,
});
