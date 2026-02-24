import { Body, Controller, Get, Post, Query, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { DonationsService } from "./donations.service";
import { PaymentMethod, Role } from "@prisma/client";
import { Roles } from "@/common/roles.decorator";
import { RolesGuard } from "@/common/roles.guard";

@ApiTags("donations")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("donations")
export class DonationsController {
  constructor(private donations: DonationsService) {}

  @Post()
  create(@Req() req: any, @Body() body: { dioceseId: string; amountCents: number; method: PaymentMethod }) {
    return this.donations.createDonation(req.user.id, body.dioceseId, body.amountCents, body.method);
  }

  @Roles(Role.ADM, Role.TESOUREIRO, Role.ARRECADACAO)
  @Get("dashboard/by-diocese")
  dashboard(@Query("year") year: string, @Query("month") month: string) {
    return this.donations.dashboardsMonthlyByDiocese(Number(year), Number(month));
  }
}
