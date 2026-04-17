const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function day(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  await prisma.bookingOption.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.roomOption.deleteMany();
  await prisma.serviceOption.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: hashPassword("Very$ecret2026!"),
      firstName: "Super",
      lastName: "Admin",
      role: "ADMIN",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "user1",
      passwordHash: hashPassword("$ecret2026!"),
      firstName: "John",
      lastName: "Doe",
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "user2",
      passwordHash: hashPassword("u$er2026!"),
      firstName: "Jane",
      lastName: "Doe",
      role: "USER",
    },
  });

  const videoProjector = await prisma.serviceOption.create({
    data: { key: "video-projector", name: "Video-Projector" },
  });
  const printer = await prisma.serviceOption.create({
    data: { key: "printer", name: "Printer" },
  });
  const coffeeMachine = await prisma.serviceOption.create({
    data: { key: "coffee-machine", name: "Coffee Machine" },
  });

  const webWorkshop = await prisma.room.create({
    data: {
      name: "The Web Workshop",
      imagePath: "/rooms/web-workshop.jpg",
      capacity: 5,
      pricePerHour: 30,
      options: {
        create: [{ serviceOptionId: videoProjector.id, price: 10, enabled: true }],
      },
    },
  });

  const ideaLab = await prisma.room.create({
    data: {
      name: "The Idea Lab",
      imagePath: "/rooms/idea-lab.jpg",
      capacity: 10,
      pricePerHour: 50,
      options: {
        create: [
          { serviceOptionId: printer.id, price: 20, enabled: true },
          { serviceOptionId: coffeeMachine.id, price: 50, enabled: true },
        ],
      },
    },
  });

  const brainery = await prisma.room.create({
    data: {
      name: "The Brainery",
      imagePath: "/rooms/brainery.jpg",
      capacity: 3,
      pricePerHour: 20,
      options: {
        create: [
          { serviceOptionId: videoProjector.id, price: 0, enabled: true },
          { serviceOptionId: printer.id, price: 30, enabled: true },
        ],
      },
    },
  });

  await prisma.creditTransaction.createMany({
    data: [
      {
        userId: user1.id,
        adminId: admin.id,
        amount: 300,
        reason: "Initial balance from imported fixtures",
        createdAt: new Date("2024-05-20T10:00:00.000Z"),
      },
      {
        userId: user2.id,
        adminId: admin.id,
        amount: 500,
        reason: "Initial balance from imported fixtures",
        createdAt: new Date("2024-05-20T10:00:00.000Z"),
      },
    ],
  });

  await prisma.booking.create({
    data: {
      userId: user1.id,
      roomId: webWorkshop.id,
      bookingDate: day("2024-06-01"),
      startHour: 9,
      endHour: 14,
      roomNameSnapshot: "The Web Workshop",
      roomPricePerHour: 20,
      roomBasePrice: 100,
      totalPrice: 130,
      createdAt: new Date("2024-05-25T18:00:00.000Z"),
      selectedOptions: {
        create: [
          { name: "Video-Projector", price: 10 },
          { name: "Printer", price: 20 },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      userId: user1.id,
      roomId: webWorkshop.id,
      bookingDate: day("2024-06-18"),
      startHour: 9,
      endHour: 14,
      roomNameSnapshot: "The Web Workshop",
      roomPricePerHour: 30,
      roomBasePrice: 150,
      totalPrice: 160,
      createdAt: new Date("2024-06-01T19:00:00.000Z"),
      selectedOptions: {
        create: [{ name: "Video-Projector", price: 10 }],
      },
    },
  });

  await prisma.booking.create({
    data: {
      userId: user2.id,
      roomId: brainery.id,
      bookingDate: day("2024-06-18"),
      startHour: 9,
      endHour: 15,
      roomNameSnapshot: "The Brainery",
      roomPricePerHour: 20,
      roomBasePrice: 120,
      totalPrice: 120,
      createdAt: new Date("2024-06-02T08:00:00.000Z"),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });