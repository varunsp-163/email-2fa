import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exists"],
    required: [true, "Email is required"],
  },

  username: {
    type: String,
    unique: [true, "Username already exists"],
    required: [true, "Username is required"],
  },

  image: {
    type: String,
  },

  verifiedViaEmail: {
    type: Boolean,
    required: [true, "Verification is required"],
    default: false,
  },

  verificationCode: {
    type: String,
    required: [true, "Verification code is required"],
  },

  verificationCodeExpires: {
    type: Date,
    required: true,
  },
});

const User = models.User || model("User", userSchema);

export default User;