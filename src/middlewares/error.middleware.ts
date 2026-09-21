// // src/middlewares/error.middleware.ts
// import type { Request, Response, NextFunction } from "express";
// import { ApiError } from "../utils/ApiError.ts";

// export const errorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let error = err;

//   // If the error isn't an instance of ApiError, wrap it
//   if (!(error instanceof ApiError)) {
//     const statusCode = error.statusCode || 500;
//     const message = error.message || "Internal Server Error";
//     error = new ApiError(statusCode, message, error?.errors || [], err.stack);
//   }

//   const response = {
//     statusCode: error.statusCode,
//     success: false,
//     message: error.message,
//     errors: error.errors,
//     ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
//   };

//   return res.status(error.statusCode).json(response);
// };