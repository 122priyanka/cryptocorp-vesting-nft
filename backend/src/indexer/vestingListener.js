require("dotenv").config();
const { ethers } = require("ethers");
const { provider } = require("../config/blockchain");
const VestingSchedule = require("../models/VestingSchedule");
const vestingABI = require("../../abis/Vesting.json");

async function startVestingIndexer() {
  const vestingAddress = process.env.VESTING_ADDRESS;
  if (!vestingAddress) {
    console.warn("VESTING_ADDRESS not set; vesting indexer disabled.");
    return;
  }

  const vestingContract = new ethers.Contract(
    process.env.VESTING_ADDRESS,
    vestingABI,
    provider
  );

  let lastProcessedBlock = await provider.getBlockNumber();
  console.log(`Starting Vesting Indexer from block ${lastProcessedBlock}...`);

  setInterval(async () => {
    try {
      const currentBlock = await provider.getBlockNumber();
      if (currentBlock <= lastProcessedBlock) return;

      const events = await vestingContract.queryFilter(
        "ScheduleCreated",
        lastProcessedBlock + 1,
        currentBlock
      );

      for (const event of events) {
        const [beneficiary, amount, releaseTime] = event.args;
        const walletAddress = ethers.getAddress(beneficiary);
        const amountTokens = parseFloat(ethers.formatEther(amount));

        await VestingSchedule.create({
          walletAddress,
          amount: amountTokens,
          releaseTime: Number(releaseTime),
          claimed: false,
        });

        console.log(
          `Indexed: ${walletAddress} - ${amountTokens} CCT @ ${new Date(Number(releaseTime) * 1000).toISOString()}`
        );
      }

      lastProcessedBlock = currentBlock;
    } catch (err) {
      console.error("Indexer polling error:", err.message);
    }
  }, 5000); // Poll every 5 seconds
}

module.exports = { startVestingIndexer };
