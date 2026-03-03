import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // For production, configure JWT_ACCESS_SECRET (and optionally JWT_REFRESH_SECRET).
    // For local/dev, we allow a fallback so the app can boot.
    const secret =
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-secret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, role: payload.role, whatsapp: payload.whatsapp, name: payload.name };
  }
}
