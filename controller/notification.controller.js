import Notification from "../model/notification.modal.js";
import { response } from "../utils/Response.utils.js";

export const getAllNotifications = async (req, res) => {
  try {
    const query = { receiver: req.user._id };
    const [allNotifications, notificationCount] = await Promise.all([
      Notification.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: "users",
            localField: "receiver",
            foreignField: "_id",
            as: "receiver",
          },
        },
        { $unwind: "$receiver" },

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
          $lookup: {
            from: "messages",
            localField: "message",
            foreignField: "_id",
            as: "message",
          },
        },
        { $unwind: "$message" },

        {
          $lookup: {
            from: "chats",
            localField: "chat",
            foreignField: "_id",
            as: "chat",
          },
        },
        { $unwind: "$chat" },

        {
          $project: {
            "receiver.username": 1,
            "receiver._id": 1,
            "sender._id": 1,
            "receiver.profilePic": 1,
            "sender.username": 1,
            "sender.profilePic": 1,
            "message.content": 1,
            "message._id": 1,
            "chat.chatName": 1,
            "chat.isGroupChat": 1,
            "chat._id": 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            notifications: { $push: "$$ROOT" },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ]),
      Notification.countDocuments({ ...query, isRead: false }),
    ]);

    response(res, 200, "Fetched all notifications", {
      allNotifications,
      notificationCount,
    });
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};

export const viewNotification = async (req, res) => {
  try {
    const userId = req.user?._id;

    await Notification.updateMany(
      { receiver: userId },
      {
        $set: {
          isRead: true,
        },
      }
    );

    response(res, 200, "All notifications marked as read");
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};
