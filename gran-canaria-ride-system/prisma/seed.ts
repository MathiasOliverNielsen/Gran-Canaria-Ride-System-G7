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

  console.log("Seeding challenges...");

  await prisma.challenge.deleteMany(); // clear old data

  await prisma.challenge.createMany({
    data: [
      {
        title: "Challenge #1",
        description: "Walk 5 kilometers today to earn 2 points",
        type: "daily",
        goal: 5,
        goalUnit: "km",
        rewardPoints: 2,
      },
      {
        title: "Challenge #2",
        description: "Complete 10,000 steps today to earn 3 points",
        type: "daily",
        goal: 10000,
        goalUnit: "steps",
        rewardPoints: 3,
      },
      {
        title: "Challenge #3",
        description: "Exercise for 30 minutes today to earn 2 points",
        type: "daily",
        goal: 30,
        goalUnit: "minutes",
        rewardPoints: 2,
      },
      {
        title: "Challenge #4",
        description: "Walk 25 kilometers this week to earn 10 points",
        type: "weekly",
        goal: 25,
        goalUnit: "km",
        rewardPoints: 10,
      },
      {
        title: "Challenge #5",
        description: "Complete 50,000 steps this week to earn 15 points",
        type: "weekly",
        goal: 50000,
        goalUnit: "steps",
        rewardPoints: 15,
      },
    ],
  });

  await prisma.rentalPoint.createMany(
    {
      data: [
        {
          name: 'Punto 1',
          latitude: 28.1097949,
          longitude: -15.418554,
        },
        {
          name: 'Punto 2',
          latitude: 28.1280274,
          longitude: -15.4497047,
        }
      ]
    }
  )

  console.log("Challenges seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
