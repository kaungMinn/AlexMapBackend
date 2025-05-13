import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const responseData = (success: "success" | "error", message: string, details?: any) => {
    return {
        success: success === "success",
        message,
        details
    }
}

//Cookies
 const clear = (cookie: "jwt",res: Response) => {
    res.clearCookie(cookie, {httpOnly: true});
    res.sendStatus(StatusCodes.NO_CONTENT);
  }

 const create = (key: string, token: string, res: Response) => {
    res.cookie(key, token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
}

export const cookieUtils = {clear, create}

//Date time
export const currentDateTime = () => {
    const today = new Date();
    const date =
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    const time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + " " + time;
    return dateTime;
};

export const dateUtils = {currentDateTime}