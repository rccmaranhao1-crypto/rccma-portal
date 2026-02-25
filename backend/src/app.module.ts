import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DioceseModule } from "./modules/diocese/diocese.module";
import { DonationsModule } from "./modules/donations/donations.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { ProductsModule } from "./modules/products/products.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { UploadsModule } from "./modules/uploads/uploads.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    DioceseModule,
    DonationsModule,
    CampaignsModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
  ],
})
export class AppModule {}
