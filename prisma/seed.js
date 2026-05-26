import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const conn = process.env.DATABASE_URL;

if (!conn || typeof conn !== "string") {
  console.error(
    "Environment variable DATABASE_URL is not set or not a string.",
  );
  console.error(
    "Example: postgresql://user:password@host:5432/dbname?schema=public",
  );
  process.exit(1);
}

try {
  const parsed = new URL(conn);
  if (!parsed.password) {
    console.error("The DATABASE_URL appears to be missing a password segment.");
    console.error(
      "Ensure your connection string includes a password, e.g. postgresql://user:pass@host:5432/db",
    );
    process.exit(1);
  }
} catch (err) {
  console.error("Failed to parse DATABASE_URL:", err?.message ?? err);
  process.exit(1);
}

const pool = new Pool({ connectionString: conn });
const adapter = new PrismaPg(pool);

const db = new PrismaClient({ adapter });

function hashPasswordSync(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@local.test";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "password123";

  const passwordHash = hashPasswordSync(adminPassword);

  console.log(`Seeding admin user ${adminEmail}`);

  const user = await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, isActive: true },
    create: {
      email: adminEmail,
      username: adminEmail.split("@")[0],
      passwordHash,
      isActive: true,
      mfaBackupCodes: [],
    },
  });

  const warung = await db.warung.upsert({
    where: { ownerId_name: { ownerId: user.id, name: "Demo Warung" } },
    update: {},
    create: {
      name: "Demo Warung",
      ownerId: user.id,
      address: "",
    },
  });

  await db.warungStaff.upsert({
    where: { warungId_userId: { warungId: warung.id, userId: user.id } },
    update: { role: "OWNER" },
    create: { warungId: warung.id, userId: user.id, role: "OWNER" },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
