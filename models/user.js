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
    // match: [/^(?=.{0,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, "Username is invalid, it should contain 8-20 alphanumeric characters and be unique!"],
  },

  image: {
    type: String,
  },
  // check the email verification
  verifiedViaEmail: {
    type: Boolean,
    required: [true, "Verification is required"],
    default: false,
  },

  verificationCode: {
    type: String,
    required: [true, "Verification code is required"],
    default: "defaultCode123", // Default verification code
  },
});

const User = models.User || model("User", userSchema);

export default User;
