import mongoose from "mongoose";
import { response } from "../utils/Response.utils.js";
import Message from "../model/message.model.js";
import Chat from "../model/chat.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content?.trim()) {
      return response(res, 400, "Content is required");
    }

    if (!chatId) {
      return response(res, 400, "chatId is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
      return response(res, 400, "Invalid chatId");
    }

    const newMessage = {
      sender: req.user?._id,
      content,
      chat: chatId,
    };

    const message = await Message.create(newMessage);

    const chat = await Chat.findById(chatId);

    chat.lastMessage = message?._id;
    await chat.save();

    await message.populate("sender", "username profilePic");
    await message.populate({
      path: "chat",
      populate: {
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username profilePic",
        },
      },
    });

    response(res, 200, "message sent", message);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};

export const allMessage = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return response(res, 400, "chatId is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
      return response(res, 400, "Invalid chatId");
    }

    const allMessage = await Message.find({ chat: chatId })
      .populate("sender", "username profilePic")
      .populate({
        path: "chat",
        populate: {
          path: "lastMessage",
          populate: {
            path: "sender",
            select: "username profilePic",
          },
        },
      });

    response(res, 200, "all message fetched", allMessage);
  } catch (error) {
    response(res, 500, "Internal server error");
  }
};
