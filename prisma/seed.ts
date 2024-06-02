import { createPassword, createProductWithName, img } from "~/lib/db-utils"
import { prisma } from "~/lib/db.server"

async function seed() {
  console.log("🌱 seeding...")
  console.time("🌱 database have been seed")

  console.time("🧹 Cleaned up the database...")
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.verification.deleteMany()
  console.timeEnd("🧹 Cleaned up the database...")

  const totalProduct = 10

  const productImages = await Promise.all([
    img({
      altText: "Cafe With Milk",
      pathFile: "public/assets/images/products/image-1.jpg",
    }),
    img({
      altText: "Green Milk tea",
      pathFile: "public/assets/images/products/image-2.jpg",
    }),
    img({
      altText: "Ginger Tea",
      pathFile: "public/assets/images/products/image-3.jpg",
    }),
    img({
      altText: "Kapuchina",
      pathFile: "public/assets/images/products/image-4.jpg",
    }),
    img({
      altText: "Red Tea",
      pathFile: "public/assets/images/products/image-5.jpg",
    }),
    img({
      altText: "Pineapple Frab",
      pathFile: "public/assets/images/products/image-6.jpg",
    }),
    img({
      altText: "Red Milk Tea",
      pathFile: "public/assets/images/products/image-7.jpg",
    }),
    img({
      altText: "Milk Tea",
      pathFile: "public/assets/images/products/image-8.jpg",
    }),
    img({
      altText: "SungWuKong Tea",
      pathFile: "public/assets/images/products/image-9.jpg",
    }),
    img({
      altText: "cafe milk Milk Modern",
      pathFile: "public/assets/images/products/image-10.jpg",
    }),
  ])
  const productNames = [
    "Cafe With Milk",
    "Green Milk",
    "Ginger Tea",
    "Kapuchino",
    "Red Tea",
    "Pineapple Tea",
    "Red Milk Tea",
    "Milk Tea",
    "Sun Wu Kong tea",
    "Cafe Milk Modern",
  ]
  for (let index = 0; index < totalProduct; index++) {
    await prisma.product.create({
      data: {
        ...createProductWithName(productNames[index]),
        image: { create: productImages[index] },
      },
    })
  }

  await prisma.user.create({
    data: {
      name: "Rot",
      username: "loofgodd",
      email: "loofgodd@rot.com",
      role: "admin",
      image: { create: productImages[0] },
      password: { create: createPassword("loofgoddcoding") },
    },
  })
  console.timeEnd("🌱 database have been seed")
}
seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
