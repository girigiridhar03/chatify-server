import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";
import { response } from "../utils/Response.utils.js";
import mongoose from "mongoose";
export const accessChat = async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      response(res, 400, "Id is required");
    }

    if (!mongoose.isValidObjectId(userid)) {
      response(res, 400, "Invalid userid");
    }

    const isChat = await Chat.findOne({
      isGroupChat: false,
      $and: [{ users: { $all: [userid, req.user?._id] } }],
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    if (isChat) {
      return response(res, 200, "chat is fetched", isChat);
    }

    const newChat = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userid],
    };

    const createdChat = await Chat.create(newChat);

    const fullChat = await Chat.findById(createdChat?._id).populate(
      "users",
      "-password"
    );

    response(res, 200, "chat is fetched", fullChat);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};

export const fetchChats = async (req, res) => {
  try {
    const loggedInUserid = req.user?._id;
    const { username } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalChats = await Chat.countDocuments({ users: loggedInUserid });
    const totalPages = Math.ceil(totalChats / limit);
    let chatsQuery = Chat.find({ users: loggedInUserid })
      .populate({
        path: "users",
        select: "-password",
      })
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "-password" },
      })
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    let chats = await chatsQuery.skip(skip).limit(limit);

    if (username) {
      const regex = new RegExp(username, "i");
      chats = chats.filter((chat) =>
        chat.users.some(
          (user) =>
            user._id.toString() !== loggedInUserid.toString() &&
            regex.test(user.username)
        )
      );
    }

    response(res, 200, "Fetched chats", { chats, totalPages });
  } catch (error) {
    console.error(error);
    response(res, 500, "Internal Server error");
  }
};

export const createGroupChats = async (req, res) => {
  try {
    const { chatName, users } = req.body;

    if (!chatName) {
      return response(res, 400, "chatname is required");
    }

    if (!users || users?.length === 0) {
      return response(res, 400, "users is required");
    }

    if (users?.length < 2) {
      return response(
        res,
        400,
        "More than 2 users is required to create group chat"
      );
    }
    users.push(req.user?._id);
    const createGroup = await Chat.create({
      chatName,
      users,
      groupAdmin: req.user?._id,
      isGroupChat: true,
    });

    const fullGroupChat = await Chat.findById(createGroup?._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    response(res, 200, "created group chat", fullGroupChat);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    if (!chatId) {
      return response(res, 400, "chatId is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
      return response(res, 400, "Invalid chatId");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return response(res, 404, "chat not found");
    }

    chat.chatName = chatName;

    await chat.save();

    return response(res, 200, "chat name is updated");
  } catch (error) {
    console.log(error);
    response(res, 500, "Internal Server error");
  }
};

export const addToGroup = async (req, res) => {
  try {
    const { chatId, users } = req.body;

    if (!chatId) {
      return response(res, 400, "chatId is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
      return response(res, 400, "Invalid chatId");
    }

    if (!users || users?.length === 0) {
      return response(res, 400, "users is required");
    }

    for (const userId of users) {
      if (!mongoose.isValidObjectId(userId)) {
        return response(res, 400, `Invalid userid: ${userId}`);
      }
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return response(res, 404, "chat not found");
    }

    chat.users = chat.users = Array.from(
      new Set([...chat.users.map(String), ...users])
    );

    await chat.save();

    response(res, 200, "user added to group");
  } catch (error) {
    console.log(error);
    response(res, 500, "Internal Server error");
  }
};

export const deleteGroupMember = async (req, res) => {
  try {
    const { chatId, userid } = req.params;

    if (!chatId) {
      return response(res, 400, "chatId is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
      return response(res, 400, "Invalid chatId");
    }
    if (!userid) {
      return response(res, 400, "userid is required");
    }

    if (!mongoose.isValidObjectId(userid)) {
      return response(res, 400, "userid chatId");
    }

    const userDetails = await User.findById(userid);

    await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userid } },
      { new: true }
    );

    response(res, 200, `${userDetails.username} has removed from group`);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};

export const getSingleChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return response(res, 400, "chatId is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
      return response(res, 400, "Invalid chatId");
    }

    const singleChat = await Chat.findById(chatId)
      .populate({
        path: "users",
        select: "-password",
      })
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "-password" },
      })
      .populate("groupAdmin", "-password");

    response(res, 200, "Fetched SingleChat", singleChat);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};
