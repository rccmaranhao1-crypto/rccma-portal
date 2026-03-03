import { Body, Controller, Post, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { OrdersService } from "./orders.service";
import { PaymentMethod } from "@prisma/client";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("orders")
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@Req() req: any, @Body() body: { items: { productId: string; qty: number }[]; method: PaymentMethod }) {
    return this.orders.createOrder(req.user.id, body.items, body.method);
  }
}
