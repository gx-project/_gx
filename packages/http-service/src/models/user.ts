import { Document, Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";
import { isValidCPF } from "@brazilian-utils/brazilian-utils";
import { emailRegex, mobileNumberRegex } from "../helpers/utils";

export interface User {
  _id: any;
  firstName: string;
  lastName: string;
  cpf: string;
  phones: string | string[];
  birth: Date;
  avatar?: string;
  emails?: string | string[];
  createdAt?: Date;
  updatedAt?: Date | null;
  groups?: number[];
  password?: string;
  ["2fa"]?: string;
}

export interface UserDocument extends User, Document {}

export interface UserModel extends UserDocument {
  compareCredential(plain: string): Promise<boolean>;
}

export const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    cpf: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator(v: string) {
          return isValidCPF(v);
        },
        message(props) {
          return `${props.value} isn't a valid cpf`;
        },
      },
    },
    phones: {
      type: Array,
      of: String,
      validate: {
        /**
         * Validate all mobile phone numbers in the list
         */
        validator: (v: string[]) =>
          v.filter((phone) => mobileNumberRegex.test(phone)).length ===
          v.length,
        message: (props) => `${props.value} has an invalid mobile phone`,
      },
      required: true,
      unique: true,
    },
    emails: {
      type: Array,
      of: String,
      validate: {
        /**
         * Validate all emails in the list
         */
        validator: (v: string[]) =>
          v.filter((email) => emailRegex.test(email)).length === v.length,
        message: (props) => `${props.value} has an invalid email`,
      },
    },
    avatar: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    birth: { type: Date, required: true },
    groups: { type: Array, of: Number, default: [1] },
    password: String,
    ["2fa"]: String,
  },
  { collection: "users" }
);

UserSchema.pre<UserDocument>("updateOne", async function () {
  this.set({ updatedAt: new Date() });
});

UserSchema.methods.compareCredential = function (plain: string) {
  return bcrypt.compare(plain, this.credential);
};

export const UserModel = model<UserModel>("User", UserSchema);
