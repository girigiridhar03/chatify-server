import { Server } from "socket.io";
import Message from "../model/message.model.js";
import Notification from "../model/notification.modal.js";
import Chat from "../model/chat.model.js";

const onlineUser = new Map();
const socketToUser = new Map();
const activeUsersInChat = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("socket is connected: ", socket.id);

    socket.on("register_user", (user) => {
      onlineUser.set(user._id, socket.id);
      socketToUser.set(socket.id, user._id);
    });

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);

      if (!activeUsersInChat.has(chatId))
        activeUsersInChat.set(chatId, new Set());

      activeUsersInChat.get(chatId).add(socketToUser.get(socket.id));
    });

    socket.on("send_message", async (data) => {
      io.to(data.chatId).emit("receive_message", {
        date: data?.date,
        chatId: data.chatId,
        messages: [
          {
            sender: { _id: data?.senderId },
            content: data.content,
            profilePic: data.profilePic,
            createdAt: data?.createdAt,
          },
        ],
      });

      const newMessage = await Message.create({
        sender: data?.senderId,
        content: data?.content,
        chat: data?.chatId,
      });

      data.usersInChat.forEach(async (userid) => {
        if (userid !== data.senderId) {
          const socketId = onlineUser.get(userid);
          const isActive = activeUsersInChat.get(data.chatId)?.has(userid);

          if (!isActive) {
            await Notification.create({
              receiver: userid,
              sender: data?.senderId,
              message: newMessage?._id,
              chat: data?.chatId,
            });
          }

          const unReadCount = await Notification.countDocuments({
            receiver: userid,
            isRead: false,
          });

          if (socketId && !isActive) {
            io.to(socketId).emit("notification", {
              chat: { _id: data.chatId },
              message: { content: data.content },
              sender: data.details,
              createdAt: new Date().toISOString(),
              _id: new Date().toISOString(),
            });
            io.to(socketId).emit("notification_count", {
              notificationCount: unReadCount,
            });
          }
        }
      });

      const chat = await Chat.findById(data?.chatId);
      chat.lastMessage = newMessage?._id;
      await chat.save();
    });

    socket.on("check_user_online", ({ selectedUser }) => {
      const online = onlineUser.has(selectedUser);
      socket.emit("user_online_status", { userId: selectedUser, online });
    });

    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("user_typing", { chatId, userId });
    });

    socket.on("stop_typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("user_stop_typing", { chatId, userId });
    });

    socket.on("leave_chat", (chatId) => {
      const userid = socketToUser.get(socket.id);

      if (activeUsersInChat.has(chatId)) {
        activeUsersInChat.get(chatId).delete(userid);
      }

      if (activeUsersInChat.get(chatId)?.size === 0) {
        activeUsersInChat.delete(chatId);
      }
    });

    socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);
      activeUsersInChat.forEach((userSet, chatId) => {
        userSet.delete(userId);
        if (userSet.size === 0) activeUsersInChat.delete(chatId);
      });
      if (userId) {
        onlineUser.delete(userId);
        socketToUser.delete(socket.id);
      }
    });
  });
};
