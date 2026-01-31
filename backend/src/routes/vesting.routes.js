const express = require("express");
const VestingSchedule = require("../models/VestingSchedule");
const { getAddress } = require("ethers");

const router = express.Router();

// Helper: Get Vesting Schedules
const getVestingCallback = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    const normalizedAddress = getAddress(walletAddress);
    const schedules = await VestingSchedule.find({
      walletAddress: normalizedAddress,
    }).sort({ releaseTime: 1 });

    res.json(schedules);
  } catch (err) {
    if (err.code === "INVALID_ARGUMENT") {
      return res.status(400).json({ message: "Invalid wallet address" });
    }
    console.error("Vesting error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/vesting/:walletAddress
router.get("/vesting/:walletAddress", getVestingCallback);

module.exports = router;
