import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding rewards...");

  await prisma.reward.deleteMany(); // clear old data (optional but good for dev)

  await prisma.reward.createMany({
    data: [
      {
        title: "Bronze Trophy",
        description: "Awarded for completing 20 KM",
        cost: 20,
      },
      {
        title: "Silver Trophy",
        description: "Awarded for completing 40 KM",
        cost: 40,
      },
      {
        title: "Gold Trophy",
        description: "Awarded for completing 60 KM",
        cost: 60,
      },
      {
        title: "Platinum Trophy",
        description: "Awarded for completing 100 KM",
        cost: 100,
      },
    ],
  });

  console.log("Rewards seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
