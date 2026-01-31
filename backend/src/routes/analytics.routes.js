const express = require("express");
const VestingSchedule = require("../models/VestingSchedule");

const router = express.Router();

// Helper: Get Total Vested Amount
const getTotalVestedHandler = async (req, res) => {
  try {
    const schedules = await VestingSchedule.find({ claimed: false });
    const totalVested = schedules.reduce((sum, s) => sum + (s.amount || 0), 0);

    res.json({
      totalVested,
      totalVestedFormatted: `${totalVested.toLocaleString()} CCT`,
      scheduleCount: schedules.length,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/analytics/total-vested
router.get("/analytics/total-vested", getTotalVestedHandler);

module.exports = router;
