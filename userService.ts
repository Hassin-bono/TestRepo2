import { db } from "./db";

export function getUserById(id: string) {
  const user = db.fetch(id);

  if (!user) {
    throw new Error(`User ${id} not found`);
  }

  return user;
}
