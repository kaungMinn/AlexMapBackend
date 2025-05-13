import { IUser } from "../../../modals/type";
import jwt from 'jsonwebtoken';

export interface TokenPayload {
    userInfo: {
      _id: string;
      displayName: string;
      roles: number[];
    };
  }

export const createToken = (
    userData: IUser,
    tokenType: 'access' | 'refresh'
  ): string => {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('Token secrets not configured');
    }

    const roles = Object.values(userData.roles!) as number[];
  
    const payload: TokenPayload = {
      userInfo: {
        _id: userData._id.toString(),
        displayName: userData.displayName,
        roles,
      },
    };
  
    const secret = tokenType === 'access' 
      ? process.env.ACCESS_TOKEN_SECRET 
      : process.env.REFRESH_TOKEN_SECRET;
  
    const expiresIn = tokenType === 'access' ? '1d' : '10d';
  
    return jwt.sign(payload, secret, { expiresIn });
  };
  
