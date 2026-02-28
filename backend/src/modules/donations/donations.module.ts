import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}
