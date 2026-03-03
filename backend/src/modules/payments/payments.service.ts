import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import axios from "axios";
import crypto from "crypto";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

type CreatePaymentInput = {
  referenceType: string;
  referenceId: string;
  method: PaymentMethod;
  amountCents: number;
  buyer?: { name?: string; whatsapp?: string };
};

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private api() {
    const baseURL = process.env.PAGBANK_BASE_URL!;
    const token = process.env.PAGBANK_TOKEN!;
    return axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  }

  async createPayment(input: CreatePaymentInput) {
    if (input.amountCents <= 0) throw new BadRequestException("Valor inválido.");

    const payment = await this.prisma.payment.create({
      data: {
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        method: input.method,
        amountCents: input.amountCents,
        status: PaymentStatus.PENDING,
      },
    });

    // === PagBank integration skeleton ===
    // Aqui você pluga os endpoints reais do PagBank.
    // Como há diferenças entre sandbox/produção e produtos, deixamos o esqueleto robusto:
    // - Cria cobrança e persiste providerId
    // - Para PIX: guarda QR e copia/cola
    // - Para Cartão: guarda providerId e status inicial
    //
    // Você só precisa preencher o payload conforme sua conta PagBank.
    try {
      if (input.method === PaymentMethod.PIX) {
        // Placeholder: simula QR Code para DEV
        const fake = {
          providerId: `pix_${payment.id}`,
          pixQrCode: `QR_CODE_BASE64_${payment.id}`,
          pixCopyPaste: `0002012658...${payment.id}...520400005303986`,
        };
        return this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            providerId: fake.providerId,
            pixQrCode: fake.pixQrCode,
            pixCopyPaste: fake.pixCopyPaste,
          },
        });
      }

      // CARD placeholder
      return this.prisma.payment.update({
        where: { id: payment.id },
        data: { providerId: `card_${payment.id}` },
      });
    } catch (e: any) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new BadRequestException("Falha ao criar pagamento.");
    }
  }

  /** Webhook: verificar assinatura (HMAC SHA256) e atualizar status */
  verifyWebhookSignature(rawBody: string, signature: string | undefined) {
    const secret = process.env.PAGBANK_WEBHOOK_SECRET!;
    if (!secret) return false;
    if (!signature) return false;
    const h = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature));
  }

  async handleWebhook(event: any) {
    // Esperado: event.providerId + event.status
    const providerId: string | undefined = event?.providerId ?? event?.data?.id ?? event?.id;
    const statusRaw: string | undefined = event?.status ?? event?.data?.status;

    if (!providerId || !statusRaw) return { ok: false };

    const status = (() => {
      const s = String(statusRaw).toUpperCase();
      if (["PAID", "CONFIRMED", "APPROVED"].includes(s)) return PaymentStatus.PAID;
      if (["CANCELED", "CANCELLED"].includes(s)) return PaymentStatus.CANCELED;
      if (["FAILED", "DECLINED"].includes(s)) return PaymentStatus.FAILED;
      return PaymentStatus.PENDING;
    })();

    const payment = await this.prisma.payment.findFirst({ where: { providerId } });
    if (!payment) return { ok: true, ignored: true };

    await this.prisma.payment.update({ where: { id: payment.id }, data: { status } });

    // Propagar para referência
    if (payment.referenceType === "donation") {
      await this.prisma.donation.updateMany({
        where: { paymentId: payment.id },
        data: {},
      });
    }
    if (payment.referenceType === "order") {
      await this.prisma.order.updateMany({
        where: { paymentId: payment.id },
        data: { status },
      });
    }
    if (payment.referenceType === "ticket") {
      await this.prisma.campaignTicket.updateMany({
        where: { paymentId: payment.id },
        data: { status },
      });
    }

    return { ok: true };
  }

  getPayment(id: string) {
    return this.prisma.payment.findUnique({ where: { id } });
  }
}
