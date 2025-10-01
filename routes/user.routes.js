import express from "express";
import {
  getUserDetails,
  groupSearch,
  searchUsers,
  signin,
  signout,
  signup,
  updateProfile,
} from "../controller/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/auth/signup", upload.single("profilepic"), signup);
userRouter.post("/auth/signin", signin);
userRouter.get("/auth/user", authMiddleware, getUserDetails);
userRouter.post("/auth/signout", signout);
userRouter.get("/auth/users", authMiddleware, searchUsers);
userRouter.patch(
  "/auth/user",
  upload.single("profilepic"),
  authMiddleware,
  updateProfile
);
userRouter.get("/auth/groupSearch", authMiddleware, groupSearch);
export default userRouter;
