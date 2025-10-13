import Notification from "../model/notification.modal.js";
import { response } from "../utils/Response.utils.js";

export const getAllNotifications = async (req, res) => {
  try {
    const allNotifications = await Notification.find({
      receiver: req?.user?._id,
      isRead: false,
    })
      .populate("receiver", "username profilePic")
      .populate("sender", "username profilePic")
      .populate("message", "content")
      .populate("chat", "_id chatName isGroupChat");

    response(res, 200, "Fetched all notifications", allNotifications);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};
