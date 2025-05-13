import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJwt";
import { nodeController } from "../controllers/node/nodeController";
import multer from "multer";

export const nodeRouter = Router();
const upload = multer({storage: multer.memoryStorage()})

nodeRouter.route("/").get(nodeController.getAll);
nodeRouter.route("/:id").get(nodeController.get)
nodeRouter.route('/').put(upload.single('image'),verifyJWT, nodeController.update);
nodeRouter.route("/").post(upload.single('image'),verifyJWT, nodeController.create);