import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class DioceseService {
  constructor(private prisma: PrismaService) {}
  list() {
    return this.prisma.diocese.findMany({ orderBy: { name: "asc" } });
  }
}
