import { Body, Controller, Get, Patch, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";
import { Roles } from "@/common/roles.decorator";
import { RolesGuard } from "@/common/roles.guard";
import { Role } from "@prisma/client";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get("me")
  me(@Req() req: any) {
    return this.users.me(req.user.id);
  }

  @Patch("me")
  updateMe(@Req() req: any, @Body() body: { name?: string; city?: string; prayerGroup?: string; dioceseId?: string }) {
    return this.users.updateSelf(req.user.id, body);
  }

  @Roles(Role.ADM)
  @Get()
  list() {
    return this.users.listUsers();
  }

  @Roles(Role.ADM)
  @Patch("promote")
  promote(@Body() body: { userId: string; role: Role }) {
    return this.users.promote(body.userId, body.role);
  }
}
