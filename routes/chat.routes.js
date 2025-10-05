import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  accessChat,
  addToGroup,
  createGroupChats,
  deleteGroupMember,
  fetchChats,
  getSingleChatDetails,
  renameGroup,
} from "../controller/chat.controller.js";
import { groupSearch } from "../controller/auth.controller.js";
const chatRoutes = express.Router();

chatRoutes.post("/chat/access/:userid", authMiddleware, accessChat);
chatRoutes.get("/chat/fetchchats", authMiddleware, fetchChats);
chatRoutes.post("/chat/createGroup", authMiddleware, createGroupChats);
chatRoutes.post("/chat/rename", authMiddleware, renameGroup);
chatRoutes.post("/chat/addtogroup", authMiddleware, addToGroup);
chatRoutes.delete(
  "/chat/deletegroupmember/chatId/:chatId/userid/:userid",
  authMiddleware,
  deleteGroupMember
);
chatRoutes.get("/chat/:chatId", authMiddleware, getSingleChatDetails);

export default chatRoutes;
