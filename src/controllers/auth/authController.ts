import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authValidation } from "../../validations/authValidations";
import User from "../../modals/User";
import bcrypt, { hash } from 'bcrypt';
import { cookieUtils, responseData } from "../../utils/utils";
import { createToken } from "./utils/token.util";
import jwt, { VerifyErrors } from 'jsonwebtoken';

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = authValidation.safeParse(req.body);
        if (!validation.success) {
            res.status(StatusCodes.BAD_REQUEST).json(responseData('error','Validation fails.', validation.error.format()));
            return;
        }

        const { name, password } = validation.data;

        const existingUser = await User.findOne({ displayName: name }).exec();

        if (!existingUser) {
            res.status(StatusCodes.UNAUTHORIZED).json(responseData('error', 'Invalid credentials.'));
            return;
        }

        const match = await bcrypt.compare(password, existingUser.password);

        if (match) {
            const accessToken = createToken(existingUser, 'access');
            const refreshToken = createToken(existingUser, 'refresh');
            existingUser.refreshToken = refreshToken;

            await existingUser.save();
            cookieUtils.create('jwt', refreshToken, res);

            res.json(responseData('success', 'Successfully login.', {accessToken}));

        } else {
            res.status(StatusCodes.UNAUTHORIZED).json(responseData('error', "User doesn't exist."))
        }

    } catch (error) {
        console.error(error);
        next(error)
    }

}

const logout = async (req: Request, res: Response) => {
    try {
        const { jwt: refreshToken } = req.cookies;
        const cleanResponse = () => {
            res.status(StatusCodes.OK).json(responseData('success', 'Cookie removed.'))
        }
        if (!refreshToken) {
            cookieUtils.clear('jwt', res);
            cleanResponse()
            return;
        }

        const existingUser = await User.findOne({ refreshToken }).exec();

        if (!existingUser) {
            cookieUtils.clear('jwt', res);
            cleanResponse();
            return;
        }

        existingUser.refreshToken = "";
        await existingUser.save();

        cookieUtils.clear('jwt', res);
        cleanResponse();
    } catch (error) {
        console.error(error)
    }
}

const refreshTheToken = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {jwt: refreshToken} = req.cookies;

        const unauthorizedResponse = () => {
            res.status(StatusCodes.UNAUTHORIZED).json(responseData('error', 'You do not have permissions.'));
        }
        
        if(!refreshToken){
            unauthorizedResponse();
            return;
        }

        const existingUser = await User.findOne({refreshToken}).exec();

        if(!existingUser){
            unauthorizedResponse();
            return;
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: VerifyErrors | null, decoded: any) => {
            if(err || existingUser.displayName !== decoded.userInfo.displayName){
                unauthorizedResponse();
                return;
            }

            const accessToken = createToken(decoded.userInfo, 'access');

            res.status(StatusCodes.CREATED).json(responseData('success', 'Token refreshed.', {accessToken}));
        })
    }catch(error){  
        console.error(error);
        next(error);
    }
}

const register = async (req: Request, res: Response): Promise<void> => {
    try{
        const validation = authValidation.safeParse(req.body);
        if(!validation.success){
            res.status(StatusCodes.BAD_REQUEST).json({
                error: "Provide name and password.",
                data: validation.error.errors
            })
            return;
        }

        const {name: displayName, password} = validation.data;
        const name = displayName.toLocaleLowerCase().trim();

        const existingUser = await User.findOne({name: name}).exec();

        if(existingUser){
            res.status(StatusCodes.CONFLICT).json({
                error: "User already exists!"
            });
            return;
        }

        const hashedPassword = await hash(password, 10);

        const result = await User.create({
            name,
            displayName,
            password: hashedPassword
        });
    

        res.status(StatusCodes.CREATED).json({success: `New user ${result.displayName} is created.`})

    }catch(error){
        console.error(error)
    }
}


export const authController = { login, logout, refreshTheToken, register }