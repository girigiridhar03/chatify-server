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

app.use("/api", userRouter);
app.use("/api", chatRoutes);

export default app;
 