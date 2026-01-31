const { ethers } = require("ethers");
const { adminWallet, provider } = require("../config/blockchain");

const nftABI = require("../../abis/MemberNFT.json");
const vestingABI = require("../../abis/Vesting.json");

const nftContract = new ethers.Contract(
  process.env.NFT_ADDRESS,
  nftABI,
  adminWallet
);

const vestingContract = new ethers.Contract(
  process.env.VESTING_ADDRESS,
  vestingABI,
  adminWallet
);


const mintNFT = async (to, tokenURI) => {
  const tx = await nftContract.mintNFT(to, tokenURI);
  await tx.wait();
};

const createVesting = async (wallet) => {
  const releaseTime = Math.floor(Date.now() / 1000) + 120;
  const tx = await vestingContract.createSchedule(
    wallet,
    ethers.parseEther("1000"),
    releaseTime
  );
  await tx.wait();
};

module.exports = { mintNFT, createVesting };
