import { IPendencie } from "./pendencie.interface";
import { IUser } from "./user.interface";

export interface IRoutePoint {
  /**
   * Latitude and longitude
   */
  coord: [number, number];
  /**
   * Primary title
   */
  primary: string;
  /**
   * Secondary title
   */
  secondary: string;
  /**
   * Slug name of district
   */
  district: string;
}

export interface IRoute {
  start: IRoutePoint;
  waypoints?: IRoutePoint[];
  end: IRoutePoint;
  path: string;
  distance: number;
  duration: number;
}

export enum RideTypes {
  Normal = "normal",
  VIG = "vig",
}

export enum RidePayMethods {
  Money = "money",
  CreditCard = "credit-card",
}

export enum RideStatus {
  CREATED = "created",
  RUNNING = "running",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export interface IRideCosts {
  /**
   * Ride cost, distance + duration
   */
  base: number;
  distance: {
    total: number;
    aditionalForLongRide: number;
    aditionalForOutBusinessTime: number;
  };
  duration: {
    total: number;
    aditionalForLongRide: number;
    aditionalForOutBusinessTime: number;
  };
  /**
   * Total cost, ride costs + pendencies costs
   */
  total: number;
}

export interface IRide {
  _id: any;
  pid: string;
  voyager: IUser;
  route: IRoute;
  type: RideTypes;
  payMethod: RidePayMethods;
  costs: IRideCosts;
  country: string;
  area: string;
  subArea: string;
  status: RideStatus;
  driver?: IUser;
}
