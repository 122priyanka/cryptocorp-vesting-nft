const express = require("express");
const { getAddress } = require("ethers");
const User = require("../models/User");
const { uploadMetadataToIPFS } = require("../services/ipfs.service");
const { mintNFT, createVesting } = require("../services/contract.service");

const router = express.Router();

// Helper: Handle Signup Logic
const signupHandler = async (req, res) => {
  try {
    const { name, email, walletAddress } = req.body;

    if (!name || !email || !walletAddress) {
      return res.status(400).json({
        message: "Name, email and walletAddress are required",
      });
    }

    const normalizedWallet = getAddress(walletAddress);
    const userExists = await User.findOne({ walletAddress: normalizedWallet });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Step 1: Store user
    const user = await User.create({
      name,
      email,
      walletAddress: normalizedWallet,
    });

    // Step 2: Prepare Metadata
    const nftImageHash = process.env.NFT_IMAGE_IPFS_HASH || "QmPlaceholderMemberBadgeImage";
    const nftImagePath = process.env.NFT_IMAGE_PATH || "";
    const imageUri = nftImageHash.startsWith("ipfs://")
      ? nftImageHash
      : nftImagePath
        ? `ipfs://${nftImageHash}/${nftImagePath}`
        : `ipfs://${nftImageHash}`;

    const metadata = {
      name: "Member Badge",
      description: "Welcome to CryptoCorp",
      image: imageUri,
    };

    // Step 3: IPFS Upload
    const tokenURI = await uploadMetadataToIPFS(metadata);
    user.nftTokenURI = tokenURI;
    await user.save();

    // Step 4: Mint NFT
    try {
      await mintNFT(normalizedWallet, tokenURI);
    } catch (mintErr) {
      console.error("mintNFT failed:", mintErr);
      return res.status(500).json({
        message: "User created but NFT minting failed. Check blockchain connection.",
      });
    }

    // Step 5: Vesting
    try {
      await createVesting(normalizedWallet);
    } catch (vestErr) {
      console.error("createVesting failed:", vestErr);
      return res.status(500).json({
        message: "User/NFT created but vesting failed. Check contract approval.",
      });
    }

    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    if (err.code === "INVALID_ARGUMENT") {
      return res.status(400).json({ message: "Invalid wallet address" });
    }
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper: Handle Login Logic
const loginHandler = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }
    const normalizedWallet = getAddress(walletAddress);
    const user = await User.findOne({ walletAddress: normalizedWallet });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    if (err.code === "INVALID_ARGUMENT") {
      return res.status(400).json({ message: "Invalid wallet address" });
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Routes
router.post("/signup", signupHandler);
router.post("/login", loginHandler);

module.exports = router;
