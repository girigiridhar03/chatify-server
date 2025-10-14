import Notification from "../model/notification.modal.js";
import { response } from "../utils/Response.utils.js";

export const getAllNotifications = async (req, res) => {
  try {
    const query = { receiver: req.user._id, isRead: false };
    const [allNotifications, notificationCount] = await Promise.all([
      Notification.find(query)
        .populate("receiver", "username profilePic")
        .populate("sender", "username profilePic")
        .populate("message", "content")
        .populate("chat", "_id chatName isGroupChat"),
      Notification.countDocuments(query),
    ]);

    response(res, 200, "Fetched all notifications", {
      allNotifications,
      notificationCount,
    });
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};
