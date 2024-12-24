// This could be defined by the ORM, for example if using Prisma
export type UserTokenDb = {
  id: string;
  email: string;
  hashedToken: string;
  expiresAt: Date;
  deletedAt: Date | null;
  createdAt: Date;
};

export type UserTokenDomain = {
  email: string;
  hashedToken: string;
  expiresAt: Date;
  isDeleted: boolean;
};
