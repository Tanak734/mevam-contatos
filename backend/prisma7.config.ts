import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Carrega o .env local ou da raiz do projeto
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
