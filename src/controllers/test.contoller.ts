import { ApiResponse } from "../utils/ApiResponse.js";
import { Request, Response } from "express";

const test = async (req: Request, res: Response): Promise<void> => {
  const responseData = { message: "API is working!" };

  res.status(200).json(new ApiResponse(200, responseData));
};

export { test };
