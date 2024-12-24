// This could be defined by the ORM, for example if using Prisma
export type UserDb = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  deletedAt: Date | null;
  createdAt: Date;
};

export type UserDomain = {
  email: string;
  firstName: string;
  lastName: string;
  isDeleted: boolean;
};
