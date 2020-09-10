import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SessionService } from "@app/session";
import { getClientIp } from "request-ip";
import { FastifyRequest } from "fastify";
import { USERS_ROLES } from "@app/database";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<USERS_ROLES[]>(
      "roles",
      context.getHandler(),
    );

    const request: FastifyRequest = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const ip = getClientIp(request.raw);
    const token = request.headers.authorization.replace("Bearer ", "");
    const session = await this.sessionService.verify(token, ip);

    if (roles && !this.sessionService.hasPermission(session, roles)) {
      throw new ForbiddenException("unauthorized");
    }

    (request as any).session = session;
    return true;
  }
}
