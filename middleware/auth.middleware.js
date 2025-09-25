import jwt from "jsonwebtoken";
import { response } from "../utils/Response.utils.js";
import User from "../model/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return response(res, 401, "Unauthorized: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?.id);

    if (!user) {
      return response(res, 404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("autherror", error);
    response(res, 500, "Internal Server error");
  }
};

export default authMiddleware;
