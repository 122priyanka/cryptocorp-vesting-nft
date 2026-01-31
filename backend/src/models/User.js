const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    walletAddress: {
      type: String,
      unique: true,
      required: true,
    },
    nftTokenURI: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
