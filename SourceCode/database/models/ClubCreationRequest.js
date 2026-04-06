const mongoose = require("mongoose");

const clubCreationRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    proposedName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    logo: {
      type: String,
      trim: true,
      default: "/images/University_of_Regina_Logo.jpg"
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClubCreationRequest", clubCreationRequestSchema);