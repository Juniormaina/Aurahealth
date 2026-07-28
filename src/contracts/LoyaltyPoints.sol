// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LoyaltyPoints
/// @notice A simple gamified loyalty points ledger where a single issuer
///         mints (earn) and burns (redeem) points for customers.
contract LoyaltyPoints {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice The account authorized to issue and redeem points.
    address public immutable issuer;

    /// @notice Points balance per customer address.
    mapping(address => uint256) public balances;

    /// @notice Total points currently in circulation (issued - redeemed).
    uint256 public totalSupply;

    /// @notice Cumulative points that have been redeemed.
    uint256 public totalRedeemed;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when points are issued to a customer.
    /// @param customer The recipient of the points.
    /// @param amount The number of points issued.
    /// @param reason A short tag describing why the points were earned.
    event PointsIssued(address indexed customer, uint256 amount, string reason);

    /// @notice Emitted when points are redeemed by a customer.
    /// @param customer The customer whose points were burned.
    /// @param amount The number of points redeemed.
    /// @param reason A short tag describing what was redeemed.
    event PointsRedeemed(address indexed customer, uint256 amount, string reason);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Deploys the contract and sets the deployer as the issuer.
    constructor() {
        issuer = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                          EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Issues loyalty points to a customer.
    /// @dev Only the issuer may call this. Increases the customer balance
    ///      and the circulating total supply.
    /// @param customer The recipient of the points.
    /// @param amount The number of points to issue (must be > 0).
    /// @param reason A short tag describing the earning activity.
    function earnPoints(address customer, uint256 amount, string calldata reason)
        external
    {
        require(msg.sender == issuer, "Not the issuer");
        require(amount > 0, "Amount must be greater than zero");

        balances[customer] += amount;
        totalSupply += amount;

        emit PointsIssued(customer, amount, reason);
    }

    /// @notice Redeems (burns) loyalty points from the caller.
    /// @dev Callable by anyone; the caller must hold enough points. Reduces the
    ///      balance and total supply, and increments the cumulative redeemed counter.
    /// @param amount The number of points to redeem (must be > 0).
    /// @param reason A short tag describing the redemption.
    function redeemPoints(uint256 amount, string calldata reason)
        external
    {
        address customer = msg.sender;
        require(amount > 0, "Amount must be greater than zero");
        require(balances[customer] >= amount, "Insufficient points");

        balances[customer] -= amount;
        totalSupply -= amount;
        totalRedeemed += amount;

        emit PointsRedeemed(customer, amount, reason);
    }

    /// @notice Returns the current loyalty point balance of a customer.
    /// @param customer The address to query.
    /// @return The customer's point balance.
    function getBalance(address customer) external view returns (uint256) {
        return balances[customer];
    }

    /// @notice Alias used by the badge and tier contracts (composition).
    /// @param customer The address to query.
    /// @return The customer's point balance.
    function pointsOf(address customer) external view returns (uint256) {
        return balances[customer];
    }

    /// @notice Outstanding liability = points currently in circulation.
    /// @return The total supply of unredeemed points.
    function outstandingLiability() external view returns (uint256) {
        return totalSupply;
    }
}
