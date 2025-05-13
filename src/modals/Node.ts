import mongoose, { Schema } from "mongoose";
import { INode, NodeModal } from "./type";

const nodeSchema = new Schema<INode>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: [true, "Location name is required"],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: [30, "Location cannot exceed 30 characters"]
    },
    displayName: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
    },
    lat: {
        type: Number,
        required: true,
    },
    lon: {
        type: Number,
        required: true
    },
    image: {
        type: String,
    }

});

const Node = mongoose.model<INode, NodeModal>("Node", nodeSchema);

export default Node;