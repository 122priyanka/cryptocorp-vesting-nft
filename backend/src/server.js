require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startVestingIndexer } = require("./indexer/vestingListener");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  startVestingIndexer().catch((err) => console.error("Vesting indexer error:", err));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
