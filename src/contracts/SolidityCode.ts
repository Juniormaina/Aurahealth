export const PROOF_OF_ADHERENCE_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfAdherence
 * @notice Verifies and records cryptographic attestations of user health check-ins on Avalanche C-Chain.
 * Mints Soulbound Tokens (SBT) for milestone adherence streaks.
 */
contract ProofOfAdherence is Ownable {
    
    struct CheckInRecord {
        bytes32 attestationHash;
        uint256 timestamp;
        uint8 checkInType; // 0: Full Daily, 1: Medication, 2: Vitals, 3: Hydration, 4: Community
        uint16 healthScore;
        uint256 cowriesEarned;
    }

    struct UserAdherence {
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 totalCheckIns;
        uint256 lastCheckInTimestamp;
        uint256 totalCowries;
    }

    // Mapping from user address => array of check-ins
    mapping(address => CheckInRecord[]) private _userCheckIns;
    
    // Mapping from user address => adherence statistics
    mapping(address => UserAdherence) public userStats;

    // Authorized attestation verifiers (e.g. Health AI oracle or Clinic node)
    mapping(address => bool) public authorizedVerifiers;

    // Soulbound Token Event
    event CheckInVerified(
        address indexed patient,
        bytes32 indexed attestationHash,
        uint256 timestamp,
        uint256 currentStreak,
        uint256 cowriesAwarded
    );

    event SoulboundBadgeIssued(
        address indexed patient,
        uint256 indexed badgeId,
        string badgeCategory
    );

    constructor() Ownable(msg.sender) {
        authorizedVerifiers[msg.sender] = true;
    }

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "ProofOfAdherence: Caller is not authorized verifier");
        _;
    }

    function setVerifier(address verifier, bool status) external onlyOwner {
        authorizedVerifiers[verifier] = status;
    }

    /**
     * @notice Submit a cryptographically hashed health attestation.
     */
    function recordCheckIn(
        address patient,
        bytes32 attestationHash,
        uint8 checkInType,
        uint16 healthScore,
        uint256 cowrieReward
    ) external onlyVerifier {
        UserAdherence storage stats = userStats[patient];

        // Streak logic (24h window with 48h grace)
        if (stats.lastCheckInTimestamp > 0 && block.timestamp - stats.lastCheckInTimestamp <= 48 hours) {
            if (block.timestamp - stats.lastCheckInTimestamp >= 18 hours) {
                stats.currentStreak += 1;
            }
        } else {
            stats.currentStreak = 1;
        }

        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }

        stats.totalCheckIns += 1;
        stats.lastCheckInTimestamp = block.timestamp;
        stats.totalCowries += cowrieReward;

        _userCheckIns[patient].push(CheckInRecord({
            attestationHash: attestationHash,
            timestamp: block.timestamp,
            checkInType: checkInType,
            healthScore: healthScore,
            cowriesEarned: cowrieReward
        }));

        emit CheckInVerified(
            patient,
            attestationHash,
            block.timestamp,
            stats.currentStreak,
            cowrieReward
        );

        // Check Milestone SBT Triggers
        if (stats.currentStreak == 7) {
            emit SoulboundBadgeIssued(patient, 1, "7-Day Health Novice");
        } else if (stats.currentStreak == 30) {
            emit SoulboundBadgeIssued(patient, 2, "30-Day Health Sentinel");
        } else if (stats.totalCheckIns == 100) {
            emit SoulboundBadgeIssued(patient, 3, "Centurion Adherence Pillar");
        }
    }

    function getUserCheckIns(address patient) external view returns (CheckInRecord[] memory) {
        return _userCheckIns[patient];
    }
}
`;

export const HEALTH_COMPANION_NFT_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HealthCompanionNFT
 * @notice Dynamic ERC-721 Companion NFT on Avalanche. Visual state, stats, and metadata evolve
 * automatically as the owner's adherence streak and check-ins progress.
 */
contract HealthCompanionNFT is ERC721, Ownable {
    using Strings for uint256;

    struct CompanionAttributes {
        string name;
        uint8 evolutionStage; // 0: Egg, 1: Hatchling, 2: Spark, 3: Guardian, 4: Luminary, 5: Celestial
        uint256 level;
        uint256 xp;
        uint16 health;
        uint16 vitality;
        uint16 harmony;
        uint256 totalEvolutions;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => CompanionAttributes) public companions;
    mapping(address => uint256) public userCompanionTokenId;

    event CompanionEvolved(uint256 indexed tokenId, uint8 newStage, uint256 level);
    event XPAccrued(uint256 indexed tokenId, uint256 xpAdded, uint256 newTotalXp);

    constructor() ERC721("Avalanche Health Companion", "AHC") Ownable(msg.sender) {}

    function mintCompanion(address to, string memory companionName) external returns (uint256) {
        require(userCompanionTokenId[to] == 0, "User already owns a Health Companion");
        
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);

        companions[tokenId] = CompanionAttributes({
            name: companionName,
            evolutionStage: 0, // Egg
            level: 1,
            xp: 0,
            health: 100,
            vitality: 100,
            harmony: 100,
            totalEvolutions: 0
        });

        userCompanionTokenId[to] = tokenId;
        return tokenId;
    }

    function addXP(uint256 tokenId, uint256 xpAmount) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Companion does not exist");
        CompanionAttributes storage comp = companions[tokenId];
        
        comp.xp += xpAmount;
        uint256 newLevel = (comp.xp / 1000) + 1;

        if (newLevel > comp.level) {
            comp.level = newLevel;
            
            // Evolution checks
            uint8 oldStage = comp.evolutionStage;
            if (comp.level >= 25 && comp.evolutionStage < 5) {
                comp.evolutionStage = 5; // Celestial
            } else if (comp.level >= 18 && comp.evolutionStage < 4) {
                comp.evolutionStage = 4; // Luminary
            } else if (comp.level >= 10 && comp.evolutionStage < 3) {
                comp.evolutionStage = 3; // Guardian
            } else if (comp.level >= 5 && comp.evolutionStage < 2) {
                comp.evolutionStage = 2; // Spark
            } else if (comp.level >= 2 && comp.evolutionStage < 1) {
                comp.evolutionStage = 1; // Hatchling
            }

            if (comp.evolutionStage > oldStage) {
                comp.totalEvolutions += 1;
                emit CompanionEvolved(tokenId, comp.evolutionStage, comp.level);
            }
        }

        emit XPAccrued(tokenId, xpAmount, comp.xp);
    }

    function getCompanionData(uint256 tokenId) external view returns (CompanionAttributes memory) {
        return companions[tokenId];
    }
}
`;

export const REWARD_SPONSOR_POOL_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RewardSponsorPool
 * @notice Holds external sponsor funds (AVAX / ERC20) from clinics, NGOs, or healthcare partners.
 * Unlocks rewards to users when verified health adherence thresholds are achieved.
 */
contract RewardSponsorPool is Ownable, ReentrancyGuard {

    struct Pool {
        uint256 poolId;
        string title;
        string sponsorName;
        uint256 totalFunded;
        uint256 totalClaimed;
        uint256 targetCommunityCheckIns;
        uint256 currentCheckIns;
        bool isMilestoneUnlocked;
        uint256 rewardPerUser;
    }

    uint256 public nextPoolId = 1;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => bool)) public hasUserClaimed;

    event PoolCreated(uint256 indexed poolId, string title, uint256 totalFunded, string sponsor);
    event PoolFunded(uint256 indexed poolId, uint256 amountAdded);
    event TargetReached(uint256 indexed poolId, uint256 totalCheckIns);
    event RewardClaimed(uint256 indexed poolId, address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createPool(
        string memory title,
        string memory sponsorName,
        uint256 targetCheckIns,
        uint256 rewardPerUser
    ) external payable onlyOwner returns (uint256) {
        require(msg.value > 0, "Sponsor funding must be > 0 AVAX");

        uint256 poolId = nextPoolId++;
        pools[poolId] = Pool({
            poolId: poolId,
            title: title,
            sponsorName: sponsorName,
            totalFunded: msg.value,
            totalClaimed: 0,
            targetCommunityCheckIns: targetCheckIns,
            currentCheckIns: 0,
            isMilestoneUnlocked: false,
            rewardPerUser: rewardPerUser
        });

        emit PoolCreated(poolId, title, msg.value, sponsorName);
        return poolId;
    }

    function incrementCommunityProgress(uint256 poolId, uint256 count) external onlyOwner {
        Pool storage pool = pools[poolId];
        require(pool.poolId != 0, "Pool does not exist");

        pool.currentCheckIns += count;

        if (pool.currentCheckIns >= pool.targetCommunityCheckIns && !pool.isMilestoneUnlocked) {
            pool.isMilestoneUnlocked = true;
            emit TargetReached(poolId, pool.currentCheckIns);
        }
    }

    function claimReward(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];
        require(pool.isMilestoneUnlocked, "Community target not yet reached");
        require(!hasUserClaimed[poolId][msg.sender], "User already claimed reward for this pool");
        require(address(this).balance >= pool.rewardPerUser, "Insufficient pool liquidity");

        hasUserClaimed[poolId][msg.sender] = true;
        pool.totalClaimed += pool.rewardPerUser;

        (bool success, ) = payable(msg.sender).call{value: pool.rewardPerUser}("");
        require(success, "AVAX transfer failed");

        emit RewardClaimed(poolId, msg.sender, pool.rewardPerUser);
    }

    receive() external payable {}
}
`;
