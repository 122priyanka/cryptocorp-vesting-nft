const mongoose = require("mongoose");

const vestingSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    amount: { type: Number, required: true }, // token amount (e.g. 1000 CCT)
    releaseTime: { type: Number, required: true }, // unix timestamp
    claimed: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "vesting_schedules" }
);

module.exports = mongoose.model("VestingSchedule", vestingSchema);
