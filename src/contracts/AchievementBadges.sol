// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// INTERFACE: Define the external interface to the LoyaltyPoints contract
// This allows AchievementBadges to read point balances without rewriting that logic
interface ILoyaltyPoints {
    function pointsOf(address) external view returns (uint256);
}

/// @title AchievementBadges — soulbound achievement registry (Session 3)
/// @notice Two award paths: issuer-attested (backend verified an off-chain action)
///         and self-claimed against an on-chain points threshold.
///         There is NO transfer function — absence IS the soulbound design.
///
/// GAMIFICATION CONCEPT: Badges are SYMBOLIC REWARDS that represent milestones and achievements.
/// Unlike points (which are fungible and interchangeable), badges are SOULBOUND - they cannot
/// be transferred. They're tied permanently to your wallet and represent your achievements.
/// Badges create a sense of PRESTIGE and provide STATUS within the gamification system.
contract AchievementBadges {
    // STORAGE: Store the address of the badge issuer (the business managing achievement awards)
    address public issuer;
    
    // STORAGE: Reference to the LoyaltyPoints contract for reading point balances
    // This demonstrates CONTRACT COMPOSITION - combining multiple smart contracts into a system
    ILoyaltyPoints public points; // Session 2's ledger — composition at work

    // STRUCT: Define the structure of a badge (blueprint for each badge type)
    // Each badge is defined by its name and the points threshold required to claim it
    struct Badge {
        string name;       // "First Save", "30-Day Streak" - human readable badge title
        uint256 threshold; // points needed to self-claim (0 = issuer-award only)
    }

    // STORAGE: Array of all badge types available in the system
    // Each badge's index in this array becomes its unique ID (badgeId)
    Badge[] public badges; // badge id = array index
    
    // STORAGE: Track which customers have earned which badges
    // This is a nested mapping: for each customer, track which badgeIds they've earned
    // If earned[customer][badgeId] = true, they've earned that badge
    mapping(address => mapping(uint256 => bool)) public earned;

    // EVENT: Emit when a badge is awarded to a customer
    // This creates an on-chain record of all badge awards for auditing and analytics
    event BadgeAwarded(address indexed customer, uint256 indexed badgeId, string name);

    // MODIFIER: Enforce that only the issuer can call certain functions
    // This gates the ability to create badges and issue them through the backend path
    modifier onlyIssuer() {
        require(msg.sender == issuer, "Not the issuer");
        _;
    }

    // CONSTRUCTOR: Initialize the contract with the issuer and ledger reference
    // Arguments:
    //   ledger = the address of the deployed LoyaltyPoints contract
    constructor(address ledger) {
        issuer = msg.sender; // Set the deployer as the badge issuer
        // Store the reference to the points contract so we can read balances
        points = ILoyaltyPoints(ledger);
    }

    /// @notice Define a new badge type. Returns its id.
    /// TEACHING POINT: The issuer controls what badges exist in the system.
    /// This function creates a NEW BADGE BLUEPRINT that customers can earn.
    function addBadge(string calldata name, uint256 threshold)
        external
        onlyIssuer
        returns (uint256 badgeId)
    {
        // Create a new badge with the given name and threshold and add it to the list
        // The index where it's stored becomes its badgeId
        badges.push(Badge(name, threshold));
        
        // Return the ID of the newly created badge (which is its array index)
        // This ID is used to reference this badge in other functions
        return badges.length - 1;
    }

    /// @notice Issuer-attested path: backend verified something off-chain.
    /// TEACHING POINT: ISSUER-AWARD PATH - The backend verified an achievement happened
    /// (e.g., completed a course, attended an event, made a purchase milestone)
    /// and awards the badge directly without requiring the customer to claim it.
    function awardBadge(address customer, uint256 badgeId) external onlyIssuer {
        // Verify that the badgeId is valid (within the array bounds)
        // Prevents awarding a badge that doesn't exist
        require(badgeId < badges.length, "No such badge");
        
        // Verify that the customer hasn't already earned this badge
        // Prevents earning the same badge twice (some badges are one-time only)
        require(!earned[customer][badgeId], "Already earned");
        
        // Record that this customer has earned this badge
        // Sets the status to true so future checks know they've earned it
        earned[customer][badgeId] = true;
        
        // Emit an event so the blockchain records this achievement
        // This creates an immutable history of who earned what and when
        emit BadgeAwarded(customer, badgeId, badges[badgeId].name);
    }

    /// @notice Self-claim path: the contract READS the ledger — no permission needed.
    /// TEACHING POINT: SELF-CLAIM PATH - Customers can claim a badge on their own
    /// if they've reached the points threshold. This creates AUTONOMY in gamification.
    /// The customer doesn't need to wait for admin approval - they can claim immediately.
    function claimBadge(uint256 badgeId) external {
        // Verify that the badgeId is valid
        require(badgeId < badges.length, "No such badge");
        
        // Load the badge details from storage into memory for efficiency
        // This is called "loading into memory" and it's cheaper than repeated storage reads
        Badge memory b = badges[badgeId];
        
        // Check that this badge is configured for self-claiming (threshold > 0)
        // If threshold is 0, the badge can ONLY be awarded by the issuer, not self-claimed
        require(b.threshold > 0, "Issuer-award only");
        
        // CRITICAL CHECK: Read the customer's point balance from the LoyaltyPoints contract
        // This demonstrates EXTERNAL CONTRACT CALLS and contract composition
        // The threshold acts as an UNLOCK CONDITION - you need X points to claim this badge
        require(points.pointsOf(msg.sender) >= b.threshold, "Threshold not met");
        
        // Verify the customer hasn't already earned this badge
        require(!earned[msg.sender][badgeId], "Already earned");
        
        // Award the badge to the customer
        earned[msg.sender][badgeId] = true;
        
        // Emit an event confirming the self-claim
        emit BadgeAwarded(msg.sender, badgeId, b.name);
    }

    /// @notice Return the total number of badge types available
    /// TEACHING POINT: Helper function for frontend/UI to know how many badges exist
    function badgeCount() external view returns (uint256) {
        return badges.length;
    }
}
