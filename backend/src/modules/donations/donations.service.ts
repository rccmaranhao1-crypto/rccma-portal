import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";
import { PaymentMethod } from "@prisma/client";

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService, private payments: PaymentsService) {}

  async createDonation(userId: string, dioceseId: string, amountCents: number, method: PaymentMethod) {
    const diocese = await this.prisma.diocese.findUnique({ where: { id: dioceseId } });
    if (!diocese) throw new BadRequestException("Diocese inválida.");

    const donation = await this.prisma.donation.create({
      data: { userId, dioceseId, amountCents },
    });

    const payment = await this.payments.createPayment({
      referenceType: "donation",
      referenceId: donation.id,
      method,
      amountCents,
    });

    await this.prisma.donation.update({ where: { id: donation.id }, data: { paymentId: payment.id } });

    return { donationId: donation.id, payment };
  }

  dashboardsMonthlyByDiocese(year: number, month: number) {
    // month 1-12
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return this.prisma.donation.groupBy({
      by: ["dioceseId"],
      where: { createdAt: { gte: start, lt: end } },
      _sum: { amountCents: true },
    });
  }
}
