const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name: {
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
    approved: {
      type: Boolean,
      default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: false
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
    
  { timestamps: true }
);

module.exports = mongoose.model("Club", clubSchema);