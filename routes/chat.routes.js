import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  accessChat,
  addToGroup,
  createGroupChats,
  deleteGroupMember,
  fetchChats,
  renameGroup,
} from "../controller/chat.controller.js";
const chatRoutes = express.Router();

chatRoutes.post("/chat/access", authMiddleware, accessChat);
chatRoutes.get("/chat/fetchchats", authMiddleware, fetchChats);
chatRoutes.post("/chat/createGroup", authMiddleware, createGroupChats);
chatRoutes.post("/chat/rename", authMiddleware, renameGroup);
chatRoutes.post("/chat/addtogroup", authMiddleware, addToGroup);
chatRoutes.delete(
  "/chat/deletegroupmember/chatId/:chatId/userid/:userid",
  authMiddleware,
  deleteGroupMember
);

export default chatRoutes;
