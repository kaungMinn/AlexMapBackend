import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || req.headers.Authorization as string;

    if (!authHeader?.startsWith("Bearer")){
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err) => {
      if (err) return res.sendStatus(StatusCodes.FORBIDDEN);
      next();
    });

}