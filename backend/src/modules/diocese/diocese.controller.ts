import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DioceseService } from "./diocese.service";

@ApiTags("diocese")
@Controller("diocese")
export class DioceseController {
  constructor(private d: DioceseService) {}
  @Get()
  list() { return this.d.list(); }
}
