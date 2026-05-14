// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn internal c;
    address internal alice = address(0xA11CE);

    function setUp() public {
        c = new CheckIn();
    }

    function test_checkIn_emits_and_sets_streak() public {
        vm.startPrank(alice);
        vm.warp(1_700_000_000); // arbitrary unix ts
        uint256 day = c.currentDay();

        vm.expectEmit(true, true, false, true);
        emit CheckIn.CheckedIn(alice, day, 1);
        c.checkIn();

        assertEq(c.lastCheckInDay(alice), day);
        assertEq(c.streakCount(alice), 1);
        vm.stopPrank();
    }

    function test_checkIn_reverts_if_value_sent() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(CheckIn.ValueNotZero.selector);
        c.checkIn{value: 1 wei}();
        vm.stopPrank();
    }

    function test_checkIn_twice_same_day_reverts() public {
        vm.startPrank(alice);
        vm.warp(1_700_000_000);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_streak_increments_consecutive_days() public {
        vm.startPrank(alice);
        uint256 t0 = 1_700_000_000;
        vm.warp(t0);
        c.checkIn();
        assertEq(c.streakCount(alice), 1);

        uint256 nextDayStart = ((t0 / 1 days) + 1) * 1 days;
        vm.warp(nextDayStart);
        c.checkIn();
        assertEq(c.streakCount(alice), 2);
        vm.stopPrank();
    }

    function test_streak_resets_after_gap() public {
        vm.startPrank(alice);
        uint256 t0 = 1_700_000_000;
        vm.warp(t0);
        c.checkIn();

        uint256 skipTwoDays = ((t0 / 1 days) + 3) * 1 days;
        vm.warp(skipTwoDays);
        c.checkIn();
        assertEq(c.streakCount(alice), 1);
        vm.stopPrank();
    }
}
