import mongoose from "mongoose";
import { IUser, UserModal } from "./type";

export const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,  // Convert to lowercase before saving
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    displayName: {
       type: String,
       required: true,
    },
    roles: {
      user: {
        type: Number,
        default: 2001,
      },
      editor: Number,
      admin: Number,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: String,
  });

  const User = mongoose.model<IUser, UserModal>("User", userSchema)

export default User;