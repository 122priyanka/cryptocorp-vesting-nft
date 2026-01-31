const { ethers, NonceManager } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(
  process.env.ADMIN_PRIVATE_KEY,
  provider
);

const adminWallet = new NonceManager(wallet);

module.exports = { provider, adminWallet };
