import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService, private payments: PaymentsService) {}

  listCampaigns() {
    return this.prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  }

  getCampaign(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        sellers: { include: { seller: { select: { id: true, name: true, whatsapp: true } } } },
      },
    });
  }

  async createCampaign(data: {
    title: string;
    description: string;
    prizeImages?: string[];
    totalTickets: number;
    numberingMode: string;
    drawDate: string;
    drawLocation: string;
    reserveMinutes: 10 | 30;
    sellerUserIds: string[];
  }) {
    if (![10, 30].includes(data.reserveMinutes)) throw new BadRequestException("reserveMinutes deve ser 10 ou 30.");
    if (data.totalTickets <= 0) throw new BadRequestException("totalTickets inválido.");

    const sellers = await this.prisma.user.findMany({ where: { id: { in: data.sellerUserIds } } });
    if (sellers.length !== data.sellerUserIds.length) throw new BadRequestException("Vendedor inválido.");

    const campaign = await this.prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        prizeImages: data.prizeImages ?? [],
        totalTickets: data.totalTickets,
        numberingMode: data.numberingMode,
        drawDate: new Date(data.drawDate),
        drawLocation: data.drawLocation,
        reserveMinutes: data.reserveMinutes,
        sellers: {
          create: data.sellerUserIds.map((sellerId) => ({ sellerId })),
        },
        tickets: {
          create: Array.from({ length: data.totalTickets }).map((_, idx) => ({
            number: idx + 1,
            buyerName: "",
            buyerWhatsapp: "",
            sellerId: data.sellerUserIds[0], // placeholder until reserved
            status: PaymentStatus.PENDING,
            reservedUntil: new Date(0),
          })),
        },
      },
    });

    return campaign;
  }

  async reserveTicket(campaignId: string, ticketNumber: number, payload: {
    buyerName: string;
    buyerWhatsapp: string;
    sellerId: string;
    method: PaymentMethod;
    amountCents: number;
  }) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new BadRequestException("Campanha não encontrada.");

    // validate seller belongs to campaign
    const sellerLink = await this.prisma.campaignSeller.findFirst({ where: { campaignId, sellerId: payload.sellerId } });
    if (!sellerLink) throw new BadRequestException("Vendedor não pertence a esta campanha.");

    const ticket = await this.prisma.campaignTicket.findUnique({
      where: { campaignId_number: { campaignId, number: ticketNumber } },
    });
    if (!ticket) throw new BadRequestException("Cota inválida.");

    const now = new Date();
    if (ticket.paymentId) {
      // if already has payment, deny
      throw new BadRequestException("Cota já reservada/comprada.");
    }

    const reservedUntil = new Date(now.getTime() + campaign.reserveMinutes * 60_000);

    const updated = await this.prisma.campaignTicket.update({
      where: { id: ticket.id },
      data: {
        buyerName: payload.buyerName,
        buyerWhatsapp: payload.buyerWhatsapp,
        sellerId: payload.sellerId,
        reservedUntil,
        status: PaymentStatus.PENDING,
      },
    });

    const payment = await this.payments.createPayment({
      referenceType: "ticket",
      referenceId: updated.id,
      method: payload.method,
      amountCents: payload.amountCents,
      buyer: { name: payload.buyerName, whatsapp: payload.buyerWhatsapp },
    });

    await this.prisma.campaignTicket.update({ where: { id: updated.id }, data: { paymentId: payment.id } });

    return { ticketId: updated.id, payment, reservedUntil };
  }

  async campaignDashboard(campaignId: string) {
    const tickets = await this.prisma.campaignTicket.findMany({ where: { campaignId } });

    const total = tickets.length;
    const paid = tickets.filter(t => t.status === "PAID").length;
    const pending = tickets.filter(t => t.status === "PENDING").length;

    // ranking by seller for PAID
    const bySeller = new Map<string, number>();
    for (const t of tickets) {
      if (t.status !== "PAID") continue;
      bySeller.set(t.sellerId, (bySeller.get(t.sellerId) ?? 0) + 1);
    }

    const sellers = await this.prisma.user.findMany({ where: { id: { in: [...bySeller.keys()] } }, select: { id: true, name: true } });
    const ranking = [...bySeller.entries()]
      .map(([sellerId, qty]) => ({ sellerId, qty, sellerName: sellers.find(s => s.id === sellerId)?.name ?? "—" }))
      .sort((a,b)=> b.qty-a.qty);

    return {
      totalTickets: total,
      paidTickets: paid,
      pendingTickets: pending,
      percentSold: total ? Math.round((paid/total)*100) : 0,
      ranking,
    };
  }
}
