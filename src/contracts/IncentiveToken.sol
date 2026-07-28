// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title IncentiveToken — a solvent, closed-loop reward token (Session 4)
/// @notice The four solvency rules, in code:
///         1. Budget-backed  — the cap is set against real fulfilment budget
///         2. Capped emission — emissionCap is immutable, set in the constructor
///         3. Sinks that work — burn on redeem: totalSupply() == live liability
///         4. Value from the product — closed-loop transfers keep points a
///            marketing tool, not a speculative asset
contract IncentiveToken is ERC20 {
    address public issuer;
    uint256 public immutable emissionCap; // the marketing budget, on-chain

    uint256 public totalEmitted; // lifetime rewards created

    mapping(address => bool) public merchant; // approved redemption partners

    event RewardIssued(address indexed customer, uint256 amount, string reason);
    event Redeemed(address indexed customer, uint256 amount, string reward);

    modifier onlyIssuer() {
        require(msg.sender == issuer, "Not issuer");
        _;
    }

    constructor(uint256 cap) ERC20("Duka Rewards", "DUKA") {
        issuer = msg.sender;
        emissionCap = cap; // set once. immutable. forever.
    }

    /// @notice The budget-enforced mint. The chain enforces the CFO.
    function issueReward(address customer, uint256 amount, string calldata reason)
        external
        onlyIssuer
    {
        require(totalEmitted + amount <= emissionCap, "Budget exhausted");
        totalEmitted += amount;
        _mint(customer, amount); // ERC-20 does the accounting
        emit RewardIssued(customer, amount, reason);
    }

    /// @notice Self-service redemption — no issuer gate. Burn keeps supply honest:
    ///         totalSupply() == outstanding liability, live, for anyone to read.
    function redeem(uint256 amount, string calldata reward) external {
        _burn(msg.sender, amount); // reverts if balance too low
        emit Redeemed(msg.sender, amount, reward);
    }

    /// @notice Issuer curates the closed loop's redemption partners.
    function setMerchant(address who, bool ok) external onlyIssuer {
        merchant[who] = ok;
    }

    /// @dev Closed loop: customers redeem & pay merchants — no open trading.
    ///      Open-loop vs closed-loop is a BUSINESS decision, not a technical one.
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            require(merchant[to] || merchant[from], "Closed-loop token");
        }
        super._update(from, to, value);
    }

    /// @notice How much budget is left to promise. remainingBudget + totalEmitted == cap.
    function remainingBudget() external view returns (uint256) {
        return emissionCap - totalEmitted;
    }
}
