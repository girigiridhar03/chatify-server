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
      console.log(chatId);
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
  });
};
