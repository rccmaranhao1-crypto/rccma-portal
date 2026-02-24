import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";
import { PaymentMethod } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private payments: PaymentsService) {}

  async createOrder(userId: string, items: { productId: string; qty: number }[], method: PaymentMethod) {
    if (!items?.length) throw new BadRequestException("Carrinho vazio.");

    const products = await this.prisma.product.findMany({ where: { id: { in: items.map(i => i.productId) } } });
    if (products.length !== items.length) throw new BadRequestException("Produto inválido.");

    let total = 0;
    for (const it of items) {
      const p = products.find(x => x.id === it.productId)!;
      if (it.qty <= 0) throw new BadRequestException("Quantidade inválida.");
      if (p.stockQty < it.qty) throw new BadRequestException(`Estoque insuficiente: ${p.name}`);
      total += p.priceCents * it.qty;
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalCents: total,
        items: {
          create: items.map(it => {
            const p = products.find(x => x.id === it.productId)!;
            return { productId: p.id, qty: it.qty, priceCents: p.priceCents };
          }),
        },
      },
      include: { items: true },
    });

    const payment = await this.payments.createPayment({
      referenceType: "order",
      referenceId: order.id,
      method,
      amountCents: total,
    });

    await this.prisma.order.update({ where: { id: order.id }, data: { paymentId: payment.id } });

    // decrement stock on payment confirmation (recommended). Here keep as-is.

    return { orderId: order.id, payment };
  }
}
