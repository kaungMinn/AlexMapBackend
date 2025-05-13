import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

interface AppError extends Error {
    statusCode?: number;
    details?: any;
  }
  
export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Something went wrong';
  
    res.status(statusCode).json({
      success: false,
      message,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };