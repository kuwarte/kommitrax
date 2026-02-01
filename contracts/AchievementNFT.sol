// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract AchievementNFT is ERC721, Ownable {
	using Strings for uint256;

	uint256 private _nextTokenId;

	struct Achievement {
		string title;
		string description;
		uint8 rarity;
		uint256 mintedAt;
	}

	mapping(uint256 => Achievement) public achievements;
	string[4] private rarityNames = ["COMMON", "RARE", "LEGENDARY", "MYTHIC"];
	string[4] private rarityColors = ["#8B8B8B", "#60A5FA", "#FF6B35", "#9333EA"];

	constructor() ERC721("KOMMITRAX Achievements", "KMTX") Ownable(msg.sender) {}

	/**
	 * @dev Block transfers to make tokens Soulbound.
	 */
	function _update(
		address to,
		uint256 tokenId,
		address auth
	) internal override returns (address) {
		address from = _ownerOf(tokenId);
		require(from == address(0) || to == address(0), "SOULBOUND: Non-transferable");
		return super._update(to, tokenId, auth);
	}

	/**
	 * @notice Mints a new badge. Only callable by the StudyCommitment contract.
	 */
	function mintAchievement(
		address to,
		string memory title,
		string memory desc,
		uint8 rarity
	) external onlyOwner {
		require(rarity <= 3, "Invalid rarity");
		uint256 tokenId = _nextTokenId++;
		_mint(to, tokenId);
		achievements[tokenId] = Achievement(title, desc, rarity, block.timestamp);
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		_requireOwned(tokenId);
		Achievement memory a = achievements[tokenId];

		string memory image = Base64.encode(bytes(generateSVG(a.title, a.rarity)));

		return
			string(
				abi.encodePacked(
					"data:application/json;base64,",
					Base64.encode(
						bytes(
							abi.encodePacked(
								'{"name": "',
								a.title,
								'",',
								'"description": "',
								a.description,
								'",',
								'"image": "data:image/svg+xml;base64,',
								image,
								'",',
								'"attributes": [{"trait_type": "Rarity", "value": "',
								rarityNames[a.rarity],
								'"}]}'
							)
						)
					)
				)
			);
	}

	function generateSVG(string memory title, uint8 rarity) internal view returns (string memory) {
		return
			string(
				abi.encodePacked(
					'<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
					'<rect width="400" height="400" fill="#F0F0F0"/>',
					'<rect x="25" y="25" width="360" height="360" fill="black"/>',
					'<rect x="20" y="20" width="360" height="360" fill="white" stroke="black" stroke-width="4"/>',
					'<rect x="20" y="20" width="360" height="60" fill="',
					rarityColors[rarity],
					'" stroke="black" stroke-width="4"/>',
					'<text x="200" y="58" text-anchor="middle" font-family="monospace" font-size="20" font-weight="900">',
					rarityNames[rarity],
					"</text>",
					'<text x="200" y="200" text-anchor="middle" font-family="monospace" font-size="22" font-weight="900">',
					title,
					"</text>",
					'<text x="200" y="350" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold">KOMMITRAX SYSTEM</text>',
					"</svg>"
				)
			);
	}
}

