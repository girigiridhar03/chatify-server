import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.static("/public"));

import userRouter from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import notificationRouter from "./routes/notification.routes.js";

app.use("/api", userRouter);
app.use("/api", chatRoutes);
app.use("/api", messageRouter);
app.use("/api", notificationRouter);

export default app;
