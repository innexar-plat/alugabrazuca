import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  check() {
    return {
      status: "ok",
      app: process.env.APP_NAME || "BrasilQuartos",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("db")
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", database: "connected" };
    } catch {
      return { status: "error", database: "disconnected" };
    }
  }
}
