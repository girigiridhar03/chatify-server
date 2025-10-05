import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { allMessage, sendMessage } from "../controller/message.controller.js";

const messageRouter = express.Router();

messageRouter.post("/message", authMiddleware, sendMessage);
messageRouter.get("/message/:chatId", authMiddleware, allMessage);

export default messageRouter;
