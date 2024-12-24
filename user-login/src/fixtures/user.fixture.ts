import { PartialGeneratorFn } from "./utils";
import { faker } from "@faker-js/faker";
import { UserDb } from "@lib/repositories/user/types";

export const generateUser: PartialGeneratorFn<UserDb> = (override) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  createdAt: faker.date.past(),
  deletedAt: null,
  ...override,
});
