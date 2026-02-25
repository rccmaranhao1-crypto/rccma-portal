import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma v5 em alguns ambientes tipa `beforeExit` de forma restritiva
    this.$on("beforeExit" as any, async () => {
      await app.close();
    });
  }
}
