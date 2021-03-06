import { IVehicle } from "@core/domain/vehicle";
import { Document, Schema, Types } from "mongoose";
import { Entities } from "../connections";
import { EDatabaseCollectionsNames } from "../constants";
import { AccountModel } from "./account";
import { VehicleMetadataModel } from "./vehicle-metadata";

export interface VehicleDocument extends Omit<IVehicle, "_id">, Document {}

export const VehicleSchema = new Schema(
  {
    owner: { type: Types.ObjectId, ref: AccountModel, required: true },
    plate: { type: String, required: true },
    year: { type: Number, required: true },
    inUse: Boolean,
    metadata: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: VehicleMetadataModel,
    },
    permissions: {
      type: Array,
      of: Schema.Types.ObjectId,
      ref: AccountModel,
    },
    verificationId: String,
  },
  { collection: EDatabaseCollectionsNames.Vehicles },
);

export const VehicleModel = Entities.model<VehicleDocument>(
  "Vehicle",
  VehicleSchema,
);
