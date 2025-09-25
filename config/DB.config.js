import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Database connected succesfully...")
  } catch (error) {
    console.log("connection failed while connecting to DB: ", error);
    process.exit(1);
  }
};

export default connectToDB