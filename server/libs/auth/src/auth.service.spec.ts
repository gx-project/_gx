/**
 * @group unit/services/auth
 */
import { Types } from "mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { CacheModule, CacheService, RedisService } from "@app/cache";
import { AuthService } from "./auth.service";
import { EUserRoles, ISession } from "@core/interfaces";
import {
  SessionRepository,
  RepositoryModule,
  AccountModel,
} from "@app/repositories";
import {
  SessionNotFoundException,
  SessionDeactivatedException,
} from "./exceptions";

describe("AuthService", () => {
  let service: AuthService;

  const mockUser = {
    firstName: "First",
    lastName: "Last",
    cpf: "123.456.789-09",
    phones: ["82988888888"],
    emails: ["valid@email.com"],
    birth: new Date("06/13/1994"),
  };

  let user = new AccountModel(mockUser);
  const sid = Types.ObjectId();
  const ua = "test";
  const ip = "127.0.0.1";

  const sessionRepositoryMock = {
    create: jest.fn().mockResolvedValue({
      _id: sid,
      userAgent: ua,
      ips: [ip],
    }),
    get: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const cacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [
            `.env.${process.env.NODE_ENV || ""}.local`,
            `.env.${process.env.NODE_ENV || ""}`,
            ".env",
          ],
        }),
        LoggerModule.forRoot(),
        RepositoryModule,
        CacheModule,
      ],
      providers: [AuthService],
    })
      .overrideProvider(RedisService)
      .useValue({})
      .overrideProvider(SessionRepository)
      .useValue(sessionRepositoryMock)
      .overrideProvider(CacheService)
      .useValue(cacheService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.restoreAllMocks());

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a session", async () => {
    const { token, session } = await service.create(user, ua, ip);

    expect(typeof token).toBe("string");
    expect(session.userAgent === ua && session.ips[0] === ip).toBeTruthy();
  });

  it("should update a session", async () => {
    sessionRepositoryMock.update.mockResolvedValue(void 0);
    sessionRepositoryMock.get.mockResolvedValue({ active: false });

    await service.update(sid, { active: false });
    const updated = await service.get(sid);

    expect((updated as ISession).active).toBe(false);
  });

  it("should check permission", () => {
    const session1 = ({
      user: { roles: [EUserRoles.Voyager] },
    } as unknown) as ISession;
    const session2 = ({
      user: { roles: [EUserRoles.Voyager, EUserRoles.Driver] },
    } as unknown) as ISession;
    const group1 = [EUserRoles.Voyager];
    const group2 = [EUserRoles.Driver];
    const group3 = [EUserRoles.Driver, "admin"] as EUserRoles[];
    const group4 = (["su"] as unknown) as EUserRoles[];

    expect(service.hasPermission(session1, group1)).toBeTruthy();
    expect(service.hasPermission(session1, group2)).toBeFalsy();
    expect(service.hasPermission(session1, group3)).toBeFalsy();
    expect(service.hasPermission(session1, group4)).toBeFalsy();
    expect(service.hasPermission(session2, group1)).toBeTruthy();
    expect(service.hasPermission(session2, group2)).toBeTruthy();
    expect(service.hasPermission(session2, group3)).toBeTruthy();
    expect(service.hasPermission(session2, group4)).toBeFalsy();
  });

  it("should verify a token", async () => {
    cacheService.get.mockResolvedValue(null);
    cacheService.set.mockResolvedValue("OK");

    const { token } = await service.create(user, ua, ip);

    const groups = [1];

    sessionRepositoryMock.get.mockResolvedValue({
      _id: sid,
      uid: user._id,
      groups,
      userAgent: ua,
      ips: [ip],
      active: true,
    });

    const session = await service.verify(token, ip);

    expect(session._id instanceof Types.ObjectId).toBeTruthy();
    expect(session.userAgent).toBe(ua);
    expect(session.ips[0]).toBe(ip);
    expect(session.active).toBeTruthy();

    cacheService.get.mockResolvedValue(session);

    const fromCache = await service.verify(token, ip);

    expect(fromCache._id instanceof Types.ObjectId).toBeTruthy();
    expect(fromCache.userAgent).toBe(ua);
    expect(fromCache.ips[0]).toBe(ip);
    expect(fromCache.active).toBeTruthy();
  });

  it("should throw an error due to deactivated or non existent session", async () => {
    cacheService.get.mockResolvedValue(null);
    cacheService.set.mockResolvedValue("OK");

    sessionRepositoryMock.get.mockResolvedValue(null);

    const { token } = await service.create(user, ua, ip);

    await expect(service.verify(token, ip)).rejects.toStrictEqual(
      new SessionNotFoundException(),
    );

    sessionRepositoryMock.get.mockResolvedValue({ active: false });

    await expect(service.verify(token, ip)).rejects.toStrictEqual(
      new SessionDeactivatedException(),
    );
  });

  it("should append ip to ip tracking field", async () => {
    const session = {
      _id: sid,
      uid: user._id,
      userAgent: ua,
      groups: [1],
      ips: [ip],
      active: true,
      user: { _id: user._id, groups: [1] },
    };

    sessionRepositoryMock.get.mockResolvedValue(session);
    sessionRepositoryMock.update.mockResolvedValue("OK");

    const newIp = "127.0.0.2";
    const { token } = await service.create(user, ua, ip);
    const { ips } = await service.verify(token, newIp);

    expect(ips.includes(newIp)).toBeTruthy();
  });
});
