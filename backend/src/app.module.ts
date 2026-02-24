import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DioceseModule } from "./modules/diocese/diocese.module";
import { DonationsModule } from "./modules/donations/donations.module";
import { ProductsModule } from "./modules/products/products.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { UploadsModule } from "./modules/uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DioceseModule,
    PaymentsModule,
    UploadsModule,
    DonationsModule,
    ProductsModule,
    OrdersModule,
    CampaignsModule,
  ],
})
export class AppModule {}
