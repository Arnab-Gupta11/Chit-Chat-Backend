import type { Prisma } from '../../../generated/prisma/client';

export const getPrismaUniqueFields = (error: Prisma.PrismaClientKnownRequestError): string[] => {
  const meta = error.meta as
    | {
        target?: string[];
        driverAdapterError?: {
          cause?: {
            constraint?: {
              fields?: string[];
            };
          };
        };
      }
    | undefined;

  return meta?.target ?? meta?.driverAdapterError?.cause?.constraint?.fields ?? [];
};
