import { NextFunction, Request, Response } from "express";
import { nodeValidation } from "../../validations/nodeValidations";
import { StatusCodes } from "http-status-codes";
import Node from "../../modals/Node";
import User from "../../modals/User";
import { dateUtils, responseData } from "../../utils/utils";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "../../configs/firebaseConfig";
import jwt from 'jsonwebtoken';
import { TokenPayload } from "../auth/utils/token.util";

//Firebase
initializeApp(firebaseConfig);
const storage = getStorage();


const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const nodes = await Node.find({}).populate('user', 'displayName').exec();
        res.status(StatusCodes.OK).json(responseData("success", "Success", nodes ));
    }catch(error){
        console.error(error);
        next(error);
    }
}

const get = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const node = await Node.findById(req.params.id);
        if(node){
            res.status(StatusCodes.OK).json(responseData('success', 'Success', node));
            return;
        }
        res.status(StatusCodes.NOT_FOUND).json(responseData('error', 'Location not found.'))
        
    }catch(error){
        console.error(error)
        next(error)
    }
}

const create = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const validation = nodeValidation.safeParse(req.body);
        if(!validation.success){
            res.status(StatusCodes.BAD_REQUEST).json(responseData('error', 'Validation failed.', validation.error.format()))
            return;
        }

        const nodeData = validation.data;
        const {jwt: refreshToken} = req.cookies;


        if(!refreshToken){
            res.status(StatusCodes.FORBIDDEN).json(responseData('error', 'Refresh token removed.'));
            return;
        }

        const {userInfo} = jwt.decode(refreshToken) as TokenPayload;

        const [existingNode, user] = await Promise.all([
            Node.findOne({ name: nodeData.name }).lean().exec(),
            User.findById(userInfo._id).lean().exec()
        ]);

        if(existingNode){
            res.status(StatusCodes.CONFLICT).json(responseData('error', 'Location Name already exists.'))
            return;
        }

        if(!user){
            res.status(StatusCodes.NOT_FOUND).json(responseData('error', 'user does not exist.'))
            return;
        }

        if(!req.file){
            const result = await Node.create({...nodeData,user: userInfo._id, image: "No Image"});
            res.status(StatusCodes.CREATED).json(responseData('success', `New location ${result.displayName} is created.`, result))
            return;
        }

        //Image upload
        const dateTime = dateUtils.currentDateTime();



        const storageRef = ref(
            storage,
            `files/${req.file?.originalname + "    " + dateTime }`
        );

        const metaData = {
            contentType: req.file?.mimetype,
        }

        const snapshot = await uploadBytesResumable(
            storageRef,
            req.file?.buffer!,
            metaData
        );

        const downloadURL = await getDownloadURL(snapshot.ref);

        const result = await Node.create({...nodeData,user: userInfo._id,  image: downloadURL});

        res.status(StatusCodes.CREATED).json(responseData('success', `New location ${result.displayName} is created.`, result))

    }catch(error){
        next(error);
    }
}

const update  = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const validation = nodeValidation.safeParse(req.body);
        if(!validation.success){
            res.status(StatusCodes.BAD_REQUEST).json(responseData('error', 'Validation failed.', validation.error.format()))
            return;
        }

        const nodeData = validation.data;
        const nodeId =  nodeData._id || req.params.id ;

        
        if(!req.file){
            const updatedNode = await Node.findByIdAndUpdate(nodeId, nodeData, {
                new: true,
                runValidators: true
            });
    
            if(!updatedNode){
                res.status(StatusCodes.NOT_FOUND).json(responseData('error', 'Location not found'));
                return;
            }    
            res.status(StatusCodes.OK).json(responseData('success', 'Location updated.', nodeData));
            return;
        }


        //Image upload
        const dateTime = dateUtils.currentDateTime();


        const storageRef = ref(
            storage,
            `files/${req.file?.originalname + "    " + dateTime }`
        );

        const metaData = {
            contentType: req.file?.mimetype,
        }

        const snapshot = await uploadBytesResumable(
            storageRef,
            req.file?.buffer!,
            metaData
        );

        const downloadURL = await getDownloadURL(snapshot.ref);

        const updatedNode = await Node.findByIdAndUpdate(nodeId, {...nodeData, image: downloadURL}, {new: true, runValidators: true});

        if(!updatedNode){
            res.status(StatusCodes.NOT_FOUND).json(responseData('error', 'Location not found'));
            return;
        }    
        res.status(StatusCodes.OK).json(responseData('success', 'Location updated.', nodeData));
        return;

    }catch(error){
        next(error)
    }
}

export const nodeController = {getAll, get, create, update}     