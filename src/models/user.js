const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) => {
          const regex = /^\S+@\S+\.\S+$/;
          return regex.test(value); // Basic email format validation
        },
        message: "Please provide a valid email address.",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum password length
    },
    role: {
      type: String,
      enum: ["user", "admin", "instructor", "superadmin"], // Defining allowed roles
      default: "user", // Default role for new users
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

// Create and export the model
const User = mongoose.model("User", userSchema);

module.exports = User;
