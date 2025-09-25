import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectToDB from "./config/DB.config.js";

connectToDB()
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`Server is running on port ${process.env.PORT}`)
    )
  )
  .catch((error) => {
    console.log("connection failed:", error.message);
    process.exit(1);
  });
