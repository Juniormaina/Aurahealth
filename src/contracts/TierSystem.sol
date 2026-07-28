// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// INTERFACE: Define the external interface for reading loyalty points
// This allows TierSystem to check point balances to determine tier levels
interface ILoyaltyPointsView {
    function pointsOf(address) external view returns (uint256);
}

/// @title TierSystem — status as a free view over the ledger (Session 3)
/// @notice Zero storage per customer, zero maintenance, can never drift out
///         of sync — because a tier IS the points balance seen through thresholds.
///
/// GAMIFICATION CONCEPT: TIER SYSTEMS create STATUS HIERARCHY and progression.
/// Instead of storing tier separately (which could drift out of sync), we compute it
/// on-demand from the points balance. If someone has 5500 points, they're automatically
/// Gold tier. No separate tier storage needed. This is elegant and trustless.
/// Tiers incentivize players to reach the next level: "Just 500 more points for Gold!"
contract TierSystem {
    // STORAGE: Reference to the LoyaltyPoints contract for reading balances
    // This demonstrates CONTRACT COMPOSITION - combining systems elegantly
    ILoyaltyPointsView public points; // composition, again

    // STORAGE: Array of point thresholds that define tier boundaries
    // The tier progression creates a LADDER that motivates continued engagement
    // Member (0 points) → Silver (1000) → Gold (5000) → Platinum (20000)
    // These numbers represent meaningful milestones that feel achievable but rewarding
    uint256[3] public thresholds = [1000, 5000, 20000];
    // Silver              Gold        Platinum

    // CONSTRUCTOR: Store the reference to the LoyaltyPoints contract
    // This allows us to read customer point balances when determining their tier
    constructor(address ledger) {
        points = ILoyaltyPointsView(ledger);
    }

    /// @notice 0 = Member, 1 = Silver, 2 = Gold, 3 = Platinum. Free to call.
    /// TEACHING POINT: Compute tier on-demand based on current point balance
    /// This is elegant because:
    /// 1. No storage overhead per customer
    /// 2. Always in sync with points (never drifts)
    /// 3. Tier automatically updates when points change
    /// 4. Free to call (view function, no gas needed)
    function tierOf(address customer) public view returns (uint8) {
        // READ: Get the customer's current point balance from the LoyaltyPoints contract
        // This is a cross-contract read - TierSystem queries another contract's data
        uint256 p = points.pointsOf(customer);
        
        // CHECK HIGHEST TIER FIRST: Platinum (tier 3)
        // If they have 20000+ points, they're at the top tier
        // Platinum represents elite status and maximum loyalty
        if (p >= thresholds[2]) return 3;
        
        // CHECK NEXT TIER: Gold (tier 2)
        // If they didn't qualify for Platinum but have 5000+ points, they're Gold
        // This tier shows strong engagement and loyalty
        if (p >= thresholds[1]) return 2;
        
        // CHECK NEXT TIER: Silver (tier 1)
        // If they have 1000+ points, they've reached Silver status
        // This is the first milestone - achievable for newcomers with some engagement
        if (p >= thresholds[0]) return 1;
        
        // DEFAULT: Member (tier 0)
        // If they have fewer than 1000 points, they're still a basic member
        // This is the entry level - everyone starts here
        return 0;
    }

    /// @notice Get the human-readable tier name for a customer
    /// TEACHING POINT: Convert numeric tier to readable names for UIs and dashboards
    function tierNameOf(address customer) external view returns (string memory) {
        // First, compute the customer's tier number using the tierOf function
        uint8 t = tierOf(customer);
        
        // MAP: Convert tier number to readable name
        // This makes the tier system understandable and appealing to users
        
        // TIER 3: Platinum - the apex/ultimate status
        if (t == 3) return "Platinum";
        
        // TIER 2: Gold - prestigious and recognizable
        if (t == 2) return "Gold";
        
        // TIER 1: Silver - achievable, shows commitment
        if (t == 1) return "Silver";
        
        // TIER 0: Member - default, entry-level status
        return "Member";
    }
}
