import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getAllNotifications } from "../controller/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/notification", authMiddleware, getAllNotifications);

export default notificationRouter;
