import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private accessConfig() {
    return {
      secret: process.env.JWT_ACCESS_SECRET!,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    };
  }
  private refreshConfig() {
    return {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
    };
  }

  async register(data: {
    name: string;
    whatsapp: string;
    birthDate: string;
    dioceseId: string;
    city: string;
    prayerGroup: string;
    password: string;
  }) {
    const exists = await this.prisma.user.findUnique({ where: { whatsapp: data.whatsapp } });
    if (exists) throw new BadRequestException("WhatsApp já cadastrado.");

    const diocese = await this.prisma.diocese.findUnique({ where: { id: data.dioceseId } });
    if (!diocese) throw new BadRequestException("Diocese inválida.");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        whatsapp: data.whatsapp,
        birthDate: new Date(data.birthDate),
        dioceseId: data.dioceseId,
        city: data.city,
        prayerGroup: data.prayerGroup,
        passwordHash,
        role: Role.USUARIO_PADRAO,
      },
      select: { id: true, name: true, whatsapp: true, role: true },
    });

    return user;
  }

  async login(whatsapp: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { whatsapp } });
    if (!user) throw new UnauthorizedException("Credenciais inválidas.");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciais inválidas.");

    const payload = { sub: user.id, role: user.role, whatsapp: user.whatsapp, name: user.name };
    const accessToken = await this.jwt.signAsync(payload, this.accessConfig());
    const refreshToken = await this.jwt.signAsync(payload, this.refreshConfig());

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.refreshToken.create({ data: { userId: user.id, tokenHash } });

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET! });
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      const stored = await this.prisma.refreshToken.findFirst({
        where: { userId: decoded.sub, tokenHash, revokedAt: null },
      });
      if (!stored) throw new UnauthorizedException("Refresh token inválido.");

      const payload = { sub: decoded.sub, role: decoded.role, whatsapp: decoded.whatsapp, name: decoded.name };
      const accessToken = await this.jwt.signAsync(payload, this.accessConfig());
      return { accessToken };
    } catch {
      throw new UnauthorizedException("Refresh token inválido.");
    }
  }

  async logout(refreshToken: string) {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }
}
