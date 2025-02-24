import { Request, Response, NextFunction } from "express";

/**
 * Global error handler to standardize error responses.
 */
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof Error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(500).json({ error: "An unknown error occurred" });
  }
};