import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, whatsapp: true, role: true, city: true, prayerGroup: true, diocese: true, birthDate: true },
    });
  }

  async promote(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, whatsapp: true, role: true },
    });
  }

  async updateSelf(userId: string, data: { name?: string; city?: string; prayerGroup?: string; dioceseId?: string }) {
    if (data.dioceseId) {
      const d = await this.prisma.diocese.findUnique({ where: { id: data.dioceseId } });
      if (!d) throw new BadRequestException("Diocese inválida.");
    }
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, whatsapp: true, role: true, city: true, prayerGroup: true, diocese: true },
    });
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, whatsapp: true, role: true, diocese: true, city: true, prayerGroup: true, createdAt: true },
    });
  }
}
