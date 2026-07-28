// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IncentiveToken} from "../contracts/IncentiveToken.sol";

/// Foundry twin of scripts/deploy.js — same env vars.
///   EMISSION_CAP in .env = the marketing budget (default 10M * 1e18)
/// Run:
///   forge script script/Deploy.s.sol --rpc-url fuji --broadcast
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        uint256 cap = vm.envOr("EMISSION_CAP", uint256(10_000_000 ether));

        console.log("Emission cap (the budget, forever):", cap);

        vm.startBroadcast(pk);
        IncentiveToken token = new IncentiveToken(cap);
        vm.stopBroadcast();

        console.log("IncentiveToken ->", address(token));
        console.log("This address + your one-slide economy = Quest 4.");
    }
}
