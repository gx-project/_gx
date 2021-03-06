import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "@app/cache";
import { TRideQuery, RideRepository, TRideUpdate } from "@app/repositories";
import { SocketService } from "@app/socket";
import {
  // Events interface,
  ERideFlowEvents,
  IOfferServer,
  IOfferRequest,
  IRideFlowEvents,
} from "@core/ride-flow";
import { CacheNamespaces, CacheTTL } from "../constants";
import { INodesEvents } from "../events/nodes";
import { PinoLogger } from "nestjs-pino";
import {
  NotInRideException,
  OfferNotFoundException,
  RideNotFoundException,
} from "../exceptions";
import { Socket } from "socket.io";
import { DriversService } from "./drivers.service";
import { retryUnderHood } from "@app/helpers/util";
import { IRide } from "@core/domain/ride";
import { IAccount } from "@core/domain/account";

@Injectable()
export class RidesService {
  /**
   * Offers list
   */
  public offers = new Map<string, IOfferServer>();

  constructor(
    readonly cacheService: CacheService,
    readonly rideRepository: RideRepository,
    readonly socketService: SocketService<IRideFlowEvents, INodesEvents>,
    private readonly logger: PinoLogger,
    readonly configService: ConfigService,
    @Inject(forwardRef(() => DriversService))
    private driversService: DriversService,
  ) {
    logger.setContext(RidesService.name);
  }

  async createOffer(offer: IOfferRequest, client: Socket, startOffer = true) {
    const ride = await this.getRide({ pid: offer.ridePID });

    if (!ride) {
      throw new RideNotFoundException();
    }

    const offerObject: IOfferServer = {
      ridePID: offer.ridePID,
      requesterSocketId: client.id,
      ignoreds: [],
      offeredTo: null,
      offerResponseTimeout: null,
    };

    client.data.rides.push(ride.pid);

    this.offers.set(offer.ridePID, offerObject);

    await this.cacheService.set(CacheNamespaces.OFFERS, ride.pid, offerObject, {
      ex: CacheTTL.OFFERS,
    });

    startOffer && this.startOffer(offerObject, ride);
  }

  /**
   * Offer a ride to drivers
   * @param {OfferServer} offer
   * @param {IRide} ride ride data
   */
  async startOffer(offer: IOfferServer, ride: IRide): Promise<void> {
    const driver = await this.driversService.match(offer, ride);

    /**
     * If don't have a match, informes to user the break time,
     * this should be rarely executed, its to avoid a long time
     * blocking of server resources.
     */
    if (!driver) {
      this.socketService.emit(
        offer.requesterSocketId,
        ERideFlowEvents.OfferGotTooLong,
        true,
      );
      return;
    }

    /**
     * Defines the current driver that received the offer
     */
    offer.offeredTo = driver.pid;

    /**
     * Emit the offer to driver
     */
    this.socketService.emit(driver.socketId, ERideFlowEvents.Offer, {
      ridePID: offer.ridePID,
    });

    /**
     * Inform the user that we have a compatible driver and we're awaiting the driver response
     */
    this.socketService.emit(
      offer.requesterSocketId,
      ERideFlowEvents.OfferSent,
      { userData: driver },
    );

    // TODO: ?maybe delegate to user the responsability of re-start an offer
    /**
     * Defines a timeout to driver response
     */
    offer.offerResponseTimeout = setTimeout(
      (driver, offer) => {
        offer.ignoreds.push(driver.pid);
        offer.offeredTo = null;
        this.startOffer(offer, ride);
      },
      this.configService.get("OFFER.DRIVER_RESPONSE_TIMEOUT") as number,
      driver,
      offer,
    );
  }

  setOfferData(
    ridePID: string,
    data: Partial<Omit<IOfferServer, "offerResponseTimeout">>,
  ): Promise<Omit<IOfferServer, "offerResponseTimeout">> {
    return this.cacheService.update(CacheNamespaces.OFFERS, ridePID, data, {
      ex: CacheTTL.OFFERS,
    });
  }

  getOfferData(
    ridePID: string,
  ): Promise<Omit<IOfferServer, "offerResponseTimeout">> {
    const data = this.cacheService.get(CacheNamespaces.OFFERS, ridePID);

    if (!data) {
      throw new OfferNotFoundException(ridePID);
    }

    return data;
  }

  async getRide(query: TRideQuery): Promise<IRide> {
    const ride = await this.rideRepository.find(query);

    if (!ride) {
      throw new RideNotFoundException();
    }

    return ride;
  }

  checkIfInRide(ride: IRide, _id: IAccount["_id"]) {
    if (ride.voyager._id !== _id && ride.driver?._id !== _id) {
      throw new NotInRideException(ride.pid, _id);
    }
  }

  isSafeCancel(acceptTimestamp: number, now: number) {
    const cancelationSafeTime = this.configService.get(
      "OFFER.SAFE_CANCELATION_WINDOW",
    ) as number;
    return acceptTimestamp + cancelationSafeTime > now;
  }

  public updateRide(query: TRideQuery, data: TRideUpdate) {
    return retryUnderHood(() => this.rideRepository.updateByQuery(query, data));
  }
}
