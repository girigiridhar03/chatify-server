import {
  deleteImageFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.config.js";
import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";
import { response } from "../utils/Response.utils.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { username, email, password, dob, gender, about } = req.body;
    const file = req.file?.path;

    if (!username) {
      return response(res, 400, "username is required");
    }
    if (!email) {
      return response(res, 400, "email is required");
    }
    if (!password) {
      return response(res, 400, "password is required");
    }
    if (!dob) {
      return response(res, 400, "dob is required");
    }
    if (!gender) {
      return response(res, 400, "gender is required");
    }

    const alreadyExistUser = await User.findOne({ email });
    if (alreadyExistUser) {
      return response(res, 400, "Email already taken.");
    }

    let uploadedFile = null;
    if (file) {
      uploadedFile = await uploadToCloudinary(file);
    }

    const newUser = new User({
      username,
      email,
      password,
      dob,
      gender,
      about,
      ...(uploadedFile && {
        profilePic: {
          url: uploadedFile?.secure_url,
          publicId: uploadedFile?.public_id,
        },
      }),
    });

    await newUser.save();

    response(res, 201, "User sign up successfully");
  } catch (error) {
    console.log("signup error:", error);
    response(res, 500, "Internal Server error");
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return response(res, 400, "email is required");
    }

    if (!password) {
      return response(res, 400, "password is required");
    }

    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return response(res, 401, "Invalid credentials");
    }

    const isPassword = await checkUser.matchPassword(password);

    if (!isPassword) {
      return response(res, 401, "Invalid credentials");
    }

    const authtoken = jwt.sign(
      {
        id: checkUser?._id,
        username: checkUser?.username,
        email: checkUser?.email,
      },
      process.env.JWT_SECRET
    );

    res.cookie("token", authtoken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 365,
      secure: false,
    });
    response(res, 200, "user sign in successfully");
  } catch (error) {
    console.log("signin error", error);
    response(res, 500, "Internal Server error");
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    response(res, 200, "user details fetched succesfull", user);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};

export const signout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      secure: false,
    });
    response(res, 200, "User Signout succesfully");
  } catch (error) {
    console.log(error);
    response(res, 500, "Internal Server error");
  }
};

export const searchUsers = async (req, res) => {
  try {
    if (!req.query.search?.trim()) {
      return response(res, 200, "No users", []);
    }

    const chats = await Chat.find({
      users: req.user?._id,
      chatName: { $eq: "sender" },
    }).select("users");
    const usersInChat = chats.flatMap((chat) =>
      chat.users
        .filter((u) => u.toString() !== req.user?._id?.toString())
        .map((u) => u.toString())
    );

    const keyword = req.query.search
      ? {
          _id: { $ne: req.user?._id, $nin: usersInChat },
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).select("-password");

    response(res, 200, "Fetched", users);
  } catch (error) {
    console.log(error);
    response(res, 500, "Internal Server error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, about, dob, gender } = req.body;
    const file = req.file?.path;
    const userId = req.user?._id;
    const user = await User.findById(userId).select("-password");

    if (file) {
      const publicId = user?.profilePic?.publicId;
      if (publicId) {
        await deleteImageFromCloudinary(publicId);
      }
      let imageResponse = await uploadToCloudinary(file);
      user.profilePic = {
        url: imageResponse?.secure_url,
        publicId: imageResponse?.public_id,
      };
    }

    if (username) user.username = username;
    if (about) user.about = about;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;

    await user.save();

    response(res, 200, "User details updated", user);
  } catch (error) {
    console.log(error);
    response(res, 500, "Internal Server error");
  }
};

export const groupSearch = async (req, res) => {
  try {
    const value = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!value?.trim()) {
      return response(res, 200, "No users", []);
    }

    const keyword = value
      ? {
          _id: { $ne: req.user._id },
          $or: [
            { username: { $regex: value, $options: "i" } },
            { email: { $regex: value, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .select("-password")
      .skip(skip)
      .limit(limit);

    response(res, 200, "fetched", users);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};

export const getSingleUserDetails = async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await User.findById(userid).select("-password");
    response(res, 200, "user details fetched succesfull", user);
  } catch (error) {
    response(res, 500, "Internal Server error");
  }
};
