import { faker } from "@faker-js/faker"
import { UniqueEnforcer } from "enforce-unique"
import fs from "node:fs"
import bcrypt from "bcryptjs"
const uniqueProductNameEnforcer = new UniqueEnforcer()
export async function img({
  altText,
  pathFile,
}: {
  altText?: string
  pathFile: string
}) {
  return {
    altText,
    contentType: pathFile.endsWith(".png") ? "image/png" : "image/jpeg",
    blob: await fs.promises.readFile(pathFile),
  }
}
export function createProduct() {
  const name = uniqueProductNameEnforcer.enforce(() => {
    return faker.internet.userName()
  })
  return {
    name,
    description: faker.lorem.words(20),
    feature: Boolean(faker.number.int({ min: 0, max: 1 })),
    price: faker.number.int({ min: 1, max: 3 }),
  }
}

export function createProductWithName(name: string) {
  return {
    name,
    description: faker.lorem.words(20),
    feature: Boolean(faker.number.int({ min: 0, max: 1 })),
    price: faker.number.int({ min: 1, max: 3 }),
  }
}
export function createPassword(password = faker.person.fullName()) {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  return {
    hash,
  }
}
