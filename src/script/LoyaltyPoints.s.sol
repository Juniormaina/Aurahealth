// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {LoyaltyPoints} from "../contracts/LoyaltyPoints.sol";

contract LoyaltyPointsScript is Script {
    function run() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        new LoyaltyPoints();

        vm.stopBroadcast();
    }
}
