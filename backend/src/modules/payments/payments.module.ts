import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsModule } from '../payments/payments.module';

@Module({
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
