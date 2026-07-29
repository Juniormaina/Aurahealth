export type EvolutionStage = 'Egg' | 'Hatchling' | 'Spark Companion' | 'Guardian Beast' | 'Luminary Spirit' | 'Celestial Sentinel';

export interface HealthCompanion {
  tokenId: number;
  name: string;
  stage: EvolutionStage;
  level: number;
  xp: number;
  xpToNextLevel: number;
  health: number; // 0-100
  vitality: number; // 0-100
  harmony: number; // 0-100
  mood: 'joyful' | 'energetic' | 'sleepy' | 'focused' | 'eager';
  streakDays: number;
  totalCheckIns: number;
  imageUrl: string;
  element: 'Aether' | 'Aqua' | 'Bio' | 'Solar';
  equippedCosmetics: string[];
}

export interface HealthCheckIn {
  id: string;
  timestamp: string;
  type: 'daily_full' | 'medication' | 'vital_log' | 'hydration' | 'community_report';
  waterOz: number;
  sleepHours: number;
  medicationTaken: boolean;
  moodRating: number; // 1-5
  activityMinutes: number;
  symptoms?: string;
  notes?: string;
  proofHash: string;
  txHash: string;
  blockNumber: number;
  cowriesEarned: number;
  xpEarned: number;
  aiAttestationScore: number; // 0-100
  aiFeedback?: string;
}

export interface SponsorPool {
  id: string;
  title: string;
  sponsorName: string;
  sponsorLogo: string;
  totalFundAvax: number;
  claimedFundAvax: number;
  targetCheckIns: number;
  currentCheckIns: number;
  deadline: string;
  rewardPerMilestone: string; // e.g. "0.05 AVAX" or "Health Care Voucher"
  category: 'Clinic Support' | 'Nutrition Grant' | 'Community Wellness' | 'Maternal Health';
  isUnlocked: boolean;
  verifiedSponsorAddress: string;
}

export interface SoulboundBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'Streak' | 'Community' | 'Prevention' | 'Sponsor Hero';
  unlockedAt?: string;
  tokenId?: number;
  txHash?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface EconomyStats {
  cowriesBalance: number;
  totalXp: number;
  avaxEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  rank: string;
  communityContributionScore: number;
}

export interface TxRecord {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  contractName: string;
  method: string;
  status: 'Confirmed' | 'Pending' | 'Failed';
  gasUsed: string;
  nAvaxFee: string;
  eventEmitted: string;
  explorersUrl: string;
}

export interface WheelPrize {
  id: string;
  label: string;
  type: 'cowries' | 'xp' | 'boost' | 'avax_ticket' | 'cosmetic';
  amount: number | string;
  color: string;
  icon: string;
}
