import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { PaymentsModule } from '../payments/payments.module'; // ajuste o path se necessário

@Module({
  imports: [PaymentsModule], // <<< IMPORTANTE
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}
