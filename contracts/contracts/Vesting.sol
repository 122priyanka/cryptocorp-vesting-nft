// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vesting is Ownable {
    IERC20 public immutable token;

    struct Schedule {
        uint256 amount;
        uint256 releaseTime;
        bool claimed;
    }

    mapping(address => Schedule[]) public schedules;

    event ScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 releaseTime
    );

    event TokensClaimed(
        address indexed beneficiary,
        uint256 amount
    );

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
    }

    function createSchedule(
        address beneficiary,
        uint256 amount,
        uint256 releaseTime
    ) external onlyOwner {
        require(releaseTime > block.timestamp, "Invalid release time");
        require(amount > 0, "Amount must be > 0");

        // Transfer tokens from admin to vesting contract
        bool success = token.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "Token transfer failed");

        schedules[beneficiary].push(
            Schedule({
                amount: amount,
                releaseTime: releaseTime,
                claimed: false
            })
        );

        emit ScheduleCreated(beneficiary, amount, releaseTime);
    }

    function claim(uint256 index) external {
        Schedule storage schedule = schedules[msg.sender][index];

        require(!schedule.claimed, "Already claimed");
        require(block.timestamp >= schedule.releaseTime, "Vesting period not ended");

        schedule.claimed = true;

        bool success = token.transfer(msg.sender, schedule.amount);
        require(success, "Transfer failed");

        emit TokensClaimed(msg.sender, schedule.amount);
    }

    function getSchedules(address user)
        external
        view
        returns (Schedule[] memory)
    {
        return schedules[user];
    }
}
