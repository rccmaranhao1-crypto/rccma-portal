import { Body, Controller, Get, Headers, Param, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get(":id")
  get(@Param("id") id: string) {
    return this.payments.getPayment(id);
  }

  @Post("webhook/pagbank")
  async webhook(@Req() req: any, @Body() body: any, @Headers("x-signature") sig?: string) {
    // Observação: em produção, configure o Nest para obter rawBody.
    // Para simplificar, usamos JSON stringificada como "raw".
    const raw = JSON.stringify(body ?? {});
    const ok = this.payments.verifyWebhookSignature(raw, sig);
    if (!ok) {
      return { ok: false, error: "invalid_signature" };
    }
    return this.payments.handleWebhook(body);
  }
}
