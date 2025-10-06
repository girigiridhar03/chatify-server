import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectToDB from "./config/DB.config.js";
import http from "http";
import { initializeSocket } from "./utils/InitializeSocket.js";

const server = http.createServer(app)

initializeSocket(server)

connectToDB()
  .then(() =>
    server.listen(process.env.PORT, () =>
      console.log(`Server is running on port ${process.env.PORT}`)
    )
  )
  .catch((error) => {
    console.log("connection failed:", error.message);
    process.exit(1);
  });
