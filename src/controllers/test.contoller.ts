import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

const test = async (req: Request, res: Response): Promise<void> => {
  const responseData = { message: "API is working!" };

  res.json(new ApiResponse(200, responseData));
};

export { test };
