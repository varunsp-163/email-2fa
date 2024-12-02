const mongoose = require("mongoose");
const express = require("express");
const { connectToDB } = require("./db/db");
const { default: User } = require("./models/user");

var cors = require("cors");
var app = express();

app.use(cors());
app.use(express.json());
const PORT = 8080;

const migrateUsers = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectToDB();

    const users = await User.updateMany(
      { verificationCode: { $exists: false } },
      { $set: { verificationCode: "defaultCode123" } }
    );

    console.log(`Migrated ${users.nModified} users with a verification code.`);
  } catch (error) {
    console.error("Error during migration:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// migrateUsers();

const getData = async () => {
  try {
    await connectToDB();

    const users = await User.find();

    console.log("All Users:", users);
    return users;
  } catch (error) {
    console.error("Error retrieving users:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// getData();

const sendEmail = async (email) => {
  console.log("Sending email for", email);
};

app.get("/get-2fa", (req, res) => {
  let isVerified = false;

  const getStatus = async () => {
    try {
      await connectToDB();
      if (!req.headers.id) {
        return res.status(400).send({ message: "ID is required in headers" });
      }
      const user = await User.findById(req.headers.id);
      if (!user) {
        res.status(404).send({ message: "User not found" });
      }
      if (user.verifiedViaEmail) {
        isVerified = true;
        res.send({
          status: true,
          text: "Email is verified",
        });
      } else {
        isVerified = false;
        sendEmail(user.email);
        res.send({
          status: false,
          text: "Email not verified. Check your mail for verification",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  getStatus();
});

app.post("/verify-code", async (req, res) => {
  const { email, code } = req.headers;
  console.log("Received verification request:", email, code);

  try {
    await connectToDB();

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided code with the stored one
    if (user.verificationCode === code) {
      user.verifiedViaEmail = true;
      await user.save();
      return res
        .status(200)
        .json({ message: "Email verified successfully!", data: "verified" });
    }

    res.status(400).json({ message: "Invalid verification code." });
  } catch (error) {
    console.error("Error verifying code:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
