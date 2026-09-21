import type { HydratedDocument } from "mongoose";
import type { IUser, IUserMethods } from "../models/user.model.ts";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser, IUserMethods>;
    }
  }
}
