import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClsService } from 'nestjs-cls';
import { AppClsStore } from '../../common/cls/cls.types';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly cls: ClsService<AppClsStore>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret') ?? 'dev-access-secret',
    });
  }

  /**
   * Runs inside the request's CLS context; populates the tenant context so the
   * Prisma tenant extension can auto-scope queries by schoolId.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    this.cls.set('userId', payload.sub);
    this.cls.set('role', payload.role);
    this.cls.set('schoolId', payload.schoolId);

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
    };
  }
}
