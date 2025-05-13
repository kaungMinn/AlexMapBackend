import { Router } from "express";
import { authController } from "../controllers/auth/authController";

export const authRouter = Router();

authRouter.post("/register", authController.register );
authRouter.post("/login", authController.login);
authRouter.get("/logout", authController.logout);
authRouter.get("/refresh", authController.refreshTheToken);