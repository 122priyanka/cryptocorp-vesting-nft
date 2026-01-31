const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("OrganizationToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const NFT = await ethers.getContractFactory("MemberNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();

  const Vesting = await ethers.getContractFactory("Vesting");
  const vesting = await Vesting.deploy(await token.getAddress());
  await vesting.waitForDeployment();

  await token.approve(
    await vesting.getAddress(),
    ethers.parseEther("500000")
  );

  const tokenAddr = await token.getAddress();
  const nftAddr = await nft.getAddress();
  const vestingAddr = await vesting.getAddress();

  console.log("Token:", tokenAddr);
  console.log("NFT:", nftAddr);
  console.log("Vesting:", vestingAddr);
  console.log("\nAdd these to backend/.env and frontend/.env (VITE_VESTING_ADDRESS):");
  console.log("TOKEN_ADDRESS=" + tokenAddr);
  console.log("NFT_ADDRESS=" + nftAddr);
  console.log("VESTING_ADDRESS=" + vestingAddr);

  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const backendAbis = path.join(__dirname, "..", "..", "backend", "abis");
  if (fs.existsSync(artifactsDir) && fs.existsSync(backendAbis)) {
    const memberNftArtifact = require(path.join(artifactsDir, "MemberNFT.sol", "MemberNFT.json"));
    const vestingArtifact = require(path.join(artifactsDir, "Vesting.sol", "Vesting.json"));
    fs.writeFileSync(path.join(backendAbis, "MemberNFT.json"), JSON.stringify(memberNftArtifact.abi, null, 2));
    fs.writeFileSync(path.join(backendAbis, "Vesting.json"), JSON.stringify(vestingArtifact.abi, null, 2));
    console.log("\nABIs copied to backend/abis");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
