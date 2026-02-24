import { Module } from "@nestjs/common";
import { DioceseController } from "./diocese.controller";
import { DioceseService } from "./diocese.service";

@Module({
  controllers: [DioceseController],
  providers: [DioceseService],
})
export class DioceseModule {}
