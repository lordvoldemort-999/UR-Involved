const mongoose = require("mongoose");

const joinRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },
    message: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("JoinRequest", joinRequestSchema);