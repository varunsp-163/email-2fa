import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const LoginActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
      default: "Unknown IP",
    },
    userAgent: {
      type: String,
      required: true,
      default: "Unknown User Agent",
    },
    status: {
      type: String,
      required: true,
      default: "default",
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
const LoginActivity =
  models.LoginActivity || model("LoginActivity", LoginActivitySchema);

export default LoginActivity;