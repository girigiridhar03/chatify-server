import { Server } from "socket.io";

const onlineUser = new Map();

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
      console.log(user);
      onlineUser.set(user._id, socket.id);
    });

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log("joined to chatid");
    });

    socket.on("send_message", (data) => {
      io.to(data.chatId).emit("receive_message", {
        sender: { _id: data?.senderId },
        content: data.content,
        profilePic: data.profilePic,
      });
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

    socket.on("disconnect", () => {
      for (let [userId, sockId] of onlineUser.entries()) {
        if (sockId === socket.id) {
          onlineUser.delete(userId);
          break;
        }
      }
    });
  });
};
