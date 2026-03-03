import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "@/common/roles.guard";
import { Roles } from "@/common/roles.decorator";
import { Role } from "@prisma/client";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  list() { return this.products.list(); }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADM)
  @Post()
  create(@Body() body: any) {
    return this.products.create(body);
  }
}
