import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CampaignsService } from "./campaigns.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "@/common/roles.guard";
import { Roles } from "@/common/roles.decorator";
import { PaymentMethod, Role } from "@prisma/client";

@ApiTags("campaigns")
@Controller("campaigns")
export class CampaignsController {
  constructor(private campaigns: CampaignsService) {}

  @Get()
  list() { return this.campaigns.listCampaigns(); }

  @Get(":id")
  get(@Param("id") id: string) { return this.campaigns.getCampaign(id); }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADM)
  @Post()
  create(@Body() body: any) { return this.campaigns.createCampaign(body); }

  @Post(":id/reserve")
  reserve(
    @Param("id") id: string,
    @Body() body: { ticketNumber: number; buyerName: string; buyerWhatsapp: string; sellerId: string; method: PaymentMethod; amountCents: number },
  ) {
    return this.campaigns.reserveTicket(id, body.ticketNumber, body, );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADM, Role.TESOUREIRO, Role.ARRECADACAO)
  @Get(":id/dashboard")
  dashboard(@Param("id") id: string) { return this.campaigns.campaignDashboard(id); }
}
