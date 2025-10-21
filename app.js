import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://chatify-client-pied.vercel.app",
];
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));

import userRouter from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import notificationRouter from "./routes/notification.routes.js";

app.use("/api", userRouter);
app.use("/api", chatRoutes);
app.use("/api", messageRouter);
app.use("/api", notificationRouter);

export default app;
