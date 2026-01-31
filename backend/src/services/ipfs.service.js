const axios = require("axios");

const uploadMetadataToIPFS = async (metadata) => {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    { pinataContent: metadata },
    {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
    }
  );

  if (!res.data?.IpfsHash) {
    throw new Error("IPFS upload failed: no hash returned");
  }
  return `ipfs://${res.data.IpfsHash}`;
};

module.exports = { uploadMetadataToIPFS };
