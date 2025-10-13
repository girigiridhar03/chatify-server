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

    const allMessage = await Message.aggregate([
      {
        $match: {
          chat: new mongoose.Types.ObjectId(chatId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },
      {
        $project: {
          content: 1,
          createdAt: 1,
          "sender._id": 1,
          "sender.username": 1,
          "sender.profilePic": 1,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          messages: { $push: "$$ROOT" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Format output for frontend
    const formatted = allMessage.map((group) => ({
      date: group._id,
      messages: group.messages,
    }));

    response(res, 200, "all message fetched", formatted);
  } catch (error) {
    response(res, 500, "Internal server error");
  }
};
