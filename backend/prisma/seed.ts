import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Dioceses list (as required)
  const dioceses = [
    "Bacabal",
    "Balsas",
    "Brejo",
    "Carolina",
    "Caxias",
    "Coroatá",
    "Grajaú",
    "Imperatriz",
    "Pinheiro",
    "São Luís do Maranhão",
    "Viana",
    "Zé Doca",
    "Outro",
  ];

  for (const name of dioceses) {
    await prisma.diocese.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const diocese = await prisma.diocese.findFirst({ where: { name: "São Luís do Maranhão" } });
  if (!diocese) throw new Error("Diocese seed failed.");

  const whatsapp = "(99)9824-7746";
  const password = "ucra01";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { whatsapp },
    update: {
      role: Role.ADM,
    },
    create: {
      name: "ADM RCC MA",
      whatsapp,
      birthDate: new Date("1990-01-01"),
      dioceseId: diocese.id,
      city: "São Luís",
      prayerGroup: "Administração",
      passwordHash: hash,
      role: Role.ADM,
    },
  });

  console.log("✅ Seed concluído: dioceses + ADM padrão.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
