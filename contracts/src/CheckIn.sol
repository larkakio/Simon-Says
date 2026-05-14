// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain check-in on Base. User pays only L2 gas; no ETH may be sent.
/// @dev Calendar day uses UTC: `block.timestamp / 1 days` (same pattern as many daily gates).
contract CheckIn {
    uint256 public constant CHECK_IN_FEE = 0;

    error ValueNotZero();
    error AlreadyCheckedInToday();

    event CheckedIn(address indexed user, uint256 indexed day, uint256 streak);

    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streakCount;

    /// @notice UTC day index: floor unix timestamp / 86400.
    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotZero();

        address user = msg.sender;
        uint256 day = currentDay();
        uint256 lastDay = lastCheckInDay[user];

        if (lastDay == day) revert AlreadyCheckedInToday();

        uint256 streak = streakCount[user];
        if (lastDay == 0) {
            streak = 1;
        } else if (day == lastDay + 1) {
            streak += 1;
        } else {
            streak = 1;
        }

        lastCheckInDay[user] = day;
        streakCount[user] = streak;

        emit CheckedIn(user, day, streak);
    }
}
