const mongoose = require("mongoose");
const express = require("express");
const { connectToDB } = require("./db/db");
const { default: User } = require("./models/user");

var cors = require("cors");
var app = express();

app.use(cors());
app.use(express.json());
const PORT = 8080;

const { default: LoginActivity } = require("./models/loginActivity");

const migrateUsers = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectToDB();

    const result = await User.updateMany(
      { status: { $type: "string" } }, // Target documents where status is a string
      { $set: { verificationCode: "code" } } // Update status to "success"
    );

    console.log(
      `Migrated ${result.modifiedCount} documents with status updated to "success".`
    );
  } catch (error) {
    console.error("Error during migration:", error.message);
  } finally {
    // Ensure database connection is closed properly
    mongoose.connection.close();
  }
};

// migrateUsers();

const getData = async () => {
  try {
    await connectToDB();

    const users = await LoginActivity.find();

    console.log("All Users:", users);
    console.log(
      "Random code:",
      Math.floor(Math.random() * 9000 + 1000).toString()
    );
    // const email = "spvarun47@gmail.com";
    const email = "varun.sp2021@vitstudent.ac.in";
    const user = await User.findOne({ email });

    // console.log("The latest user:", user);
    const latestSession = await LoginActivity.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(2);

    console.log("The lastsession:", latestSession);

    return users;
  } catch (error) {
    console.error("Error retrieving users:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

getData();

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
