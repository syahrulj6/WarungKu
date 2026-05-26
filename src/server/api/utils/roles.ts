import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function hasManagerOrOwner(
  db: PrismaClient,
  warungId: string,
  userId: string | undefined,
) {
  if (!userId) return false;

  // Check owner
  const warung = await db.warung.findUnique({
    where: { id: warungId },
    select: { ownerId: true },
  });
  if (warung?.ownerId === userId) return true;

  // Check staff role
  const staff = await db.warungStaff.findFirst({
    where: { warungId, userId, role: { in: ["OWNER", "MANAGER"] } } as any,
  });
  return !!staff;
}

export async function assertManagerOrOwner(
  db: PrismaClient,
  warungId: string,
  userId: string | undefined,
) {
  const ok = await hasManagerOrOwner(db, warungId, userId);
  if (!ok)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient role: manager or owner required",
    });
}

export async function getAuthorizedWarungIds(
  db: PrismaClient,
  userId: string | undefined,
) {
  if (!userId) return [];

  const owned = await db.warung.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const staff = await db.warungStaff.findMany({
    where: { userId, role: { in: ["OWNER", "MANAGER"] } } as any,
    select: { warungId: true },
  });

  const ids = new Set<string>();
  for (const w of owned) ids.add(w.id);
  for (const s of staff) ids.add(s.warungId);

  return Array.from(ids);
}
