import { Model, Schema } from "mongoose";
import { z } from "zod";
import { nodeValidation } from "../validations/nodeValidations";

export type Roles = {
    user: number;
    editor?: number;
    admin?: number;
};

export interface IUser extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    displayName: string;
    roles: roles;
    password: string;
    refreshToken?: string;
}


export interface INode extends Document {
    _id: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    name: string;
    displayName: string;
    desc: string;
    lat: number;
    lon: number;
    image: string;
}


// export type INode = z.infer<typeof nodeValidation>


export type UserModal = Model<IUser>
export type NodeModal = Model<INode>