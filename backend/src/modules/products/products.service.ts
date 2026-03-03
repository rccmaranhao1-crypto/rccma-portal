import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(data: { name: string; description: string; priceCents: number; stockQty: number; images?: string[]; sizes?: string[] }) {
    if (data.priceCents <= 0) throw new BadRequestException("Preço inválido.");
    if (data.stockQty < 0) throw new BadRequestException("Estoque inválido.");
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        stockQty: data.stockQty,
        images: data.images ?? [],
        sizes: data.sizes ?? [],
      },
    });
  }
}
