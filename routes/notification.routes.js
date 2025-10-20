import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getAllNotifications,
  viewNotification,
} from "../controller/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/notification", authMiddleware, getAllNotifications);
notificationRouter.put("/notification/view", authMiddleware, viewNotification);

export default notificationRouter;
