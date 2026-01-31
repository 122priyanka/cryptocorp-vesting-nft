// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemberNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("CryptoCorp Member", "CCM") 
        Ownable(msg.sender){
    }

    function mintNFT(
        address recipient,
        string memory uri
    ) external onlyOwner returns (uint256) {
        _nextTokenId++;
        uint256 tokenId = _nextTokenId;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}
