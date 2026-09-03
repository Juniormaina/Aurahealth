import { ethers } from 'ethers';
import { TxRecord } from '../types';

export const AVALANCHE_FUJI_CONFIG = {
  chainId: '0xa869', // 43113
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://avalanche.testnet.routescan.io'],
};

export const EXPLORER_BASE = AVALANCHE_FUJI_CONFIG.blockExplorerUrls[0];

// Live, verified contracts deployed to Avalanche Fuji (see /deployments.json
// and README.md — "On-Chain Deployment"). These are the real gamification
// mechanics behind the app: a points ledger, badges, streaks, tiers, and a
// budget-capped reward token.
export const CONTRACT_ADDRESSES = {
  LoyaltyPoints: '0x337769E522647D1541Acc8F20381d9a43B75d4bD',
  AchievementBadges: '0x159Bc84b1B693A6235d8C6EE46eC7c5AF120926e',
  StreakTracker: '0xC926fb9344D6C0C7BC3F22549850a847cb0C0b92',
  TierSystem: '0x52bEc6D4aA6DFA6a2A8c9ffDc15b63C68122cc46',
  IncentiveToken: '0x4B446a6f8de7F58951c74Aaa6c98D0666f165FfE',
};

const STREAK_TRACKER_ABI = [
  'function checkIn() external',
  'function streakOf(address user) external view returns (uint32 current, uint32 longest, uint64 lastCheckIn)',
];

const LOYALTY_POINTS_ABI = [
  'function pointsOf(address customer) external view returns (uint256)',
  'function outstandingLiability() external view returns (uint256)',
];

const TIER_SYSTEM_ABI = [
  'function tierOf(address customer) external view returns (uint8)',
  'function tierNameOf(address customer) external view returns (string)',
];

const INCENTIVE_TOKEN_ABI = [
  'function totalSupply() external view returns (uint256)',
  'function totalEmitted() external view returns (uint256)',
  'function remainingBudget() external view returns (uint256)',
];

const ACHIEVEMENT_BADGES_ABI = [
  'function badgeCount() external view returns (uint256)',
  'function earned(address customer, uint256 badgeId) external view returns (bool)',
];

let readProvider: ethers.JsonRpcProvider | null = null;
function getReadProvider(): ethers.JsonRpcProvider {
  if (!readProvider) {
    readProvider = new ethers.JsonRpcProvider(AVALANCHE_FUJI_CONFIG.rpcUrls[0]);
  }
  return readProvider;
}

/** Read-only contract handles, safe to call without a connected wallet. */
export function getReadOnlyContracts() {
  const provider = getReadProvider();
  return {
    loyaltyPoints: new ethers.Contract(CONTRACT_ADDRESSES.LoyaltyPoints, LOYALTY_POINTS_ABI, provider),
    streakTracker: new ethers.Contract(CONTRACT_ADDRESSES.StreakTracker, STREAK_TRACKER_ABI, provider),
    tierSystem: new ethers.Contract(CONTRACT_ADDRESSES.TierSystem, TIER_SYSTEM_ABI, provider),
    incentiveToken: new ethers.Contract(CONTRACT_ADDRESSES.IncentiveToken, INCENTIVE_TOKEN_ABI, provider),
    achievementBadges: new ethers.Contract(CONTRACT_ADDRESSES.AchievementBadges, ACHIEVEMENT_BADGES_ABI, provider),
  };
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  shortAddress: string;
  avaxBalance: string;
  networkName: string;
  isSandbox: boolean;
  providerName?: string;
}

export const SANDBOX_WALLET: WalletState = {
  isConnected: true,
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  shortAddress: '0x71C7...976F',
  avaxBalance: '4.85 Care Credits',
  networkName: 'AuraHealth Verification Ledger',
  isSandbox: true,
  providerName: 'Sandbox',
};

export class WalletConnectError extends Error {
  code: 'no_provider' | 'rejected' | 'unknown';
  constructor(code: WalletConnectError['code'], message: string) {
    super(message);
    this.name = 'WalletConnectError';
    this.code = code;
  }
}

type InjectedEthereum = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
  isAvalanche?: boolean;
  isCore?: boolean;
  providers?: InjectedEthereum[];
};

function detectProviderName(provider: InjectedEthereum): string {
  if (provider.isAvalanche || provider.isCore) return 'Core';
  if (provider.isMetaMask) return 'MetaMask';
  return 'Browser wallet';
}

/** Prefer Core, then MetaMask, when several wallets inject into the page. */
function getInjectedProvider(): InjectedEthereum | null {
  if (typeof window === 'undefined') return null;
  const eth = (window as Window & { ethereum?: InjectedEthereum }).ethereum;
  if (!eth) return null;
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    return (
      eth.providers.find((p) => p.isAvalanche || p.isCore) ||
      eth.providers.find((p) => p.isMetaMask) ||
      eth.providers[0]
    );
  }
  return eth;
}

function networkLabel(chainId: bigint | number): string {
  const id = Number(chainId);
  if (id === 43113) return AVALANCHE_FUJI_CONFIG.chainName;
  if (id === 43114) return 'Avalanche C-Chain';
  if (id === 1) return 'Ethereum Mainnet';
  return `Chain ${id}`;
}

/**
 * Local product activity (check-in without a wallet, loot wheel, sponsor UI).
 * Never looks like a Fuji receipt: no 0x hash, no Confirmed, no explorer URL.
 */
export function createOffChainActivityRecord(activity: string, detail: string): TxRecord {
  return {
    hash: `local-${Date.now().toString(36)}`,
    timestamp: new Date().toLocaleString(),
    from: 'app',
    to: '—',
    contractName: activity,
    method: 'off-chain',
    status: 'Off-chain',
    gasUsed: '—',
    nAvaxFee: '—',
    eventEmitted: detail,
    onChain: false,
  };
}

/**
 * Real StreakTracker.checkIn() on Avalanche Fuji. Returns null if there is
 * no injected wallet, the chain is not Fuji, or the call reverts (including
 * "already checked in today"). Callers should save the check-in locally
 * without inventing a transaction hash.
 */
export async function checkInOnChain(): Promise<TxRecord | null> {
  const injected = getInjectedProvider();
  if (!injected) return null;

  try {
    const provider = new ethers.BrowserProvider(injected);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== 43113) return null; // not on Fuji — skip real tx

    const signer = await provider.getSigner();
    const streaks = new ethers.Contract(CONTRACT_ADDRESSES.StreakTracker, STREAK_TRACKER_ABI, signer);
    const tx = await streaks.checkIn();
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toLocaleString(),
      from: await signer.getAddress(),
      to: CONTRACT_ADDRESSES.StreakTracker,
      contractName: 'StreakTracker.sol',
      method: 'checkIn',
      status: 'Confirmed',
      gasUsed: receipt.gasUsed.toString(),
      nAvaxFee: ethers.formatEther(receipt.gasUsed * (receipt.gasPrice ?? 0n)) + ' AVAX',
      eventEmitted: 'CheckedIn',
      explorersUrl: `${EXPLORER_BASE}/tx/${receipt.hash}`,
      onChain: true,
    };
  } catch (e) {
    console.warn('On-chain check-in unavailable:', e);
    return null;
  }
}

export type ConnectWalletOptions = {
  /** When true, missing wallet / cancel throws instead of returning the sandbox wallet. */
  requireWallet?: boolean;
};

// Check or connect Web3 Wallet (Core Wallet, MetaMask, and other injected providers).
// Does not force a network switch — uses whatever chain the wallet is on.
export async function connectWeb3Wallet(options: ConnectWalletOptions = {}): Promise<WalletState> {
  const { requireWallet = false } = options;
  const injected = getInjectedProvider();

  if (!injected) {
    if (requireWallet) {
      throw new WalletConnectError(
        'no_provider',
        'No wallet found. Install Core or MetaMask, then refresh this page.'
      );
    }
    return SANDBOX_WALLET;
  }

  try {
    const provider = new ethers.BrowserProvider(injected);
    const accounts = (await provider.send('eth_requestAccounts', [])) as string[];
    if (!accounts?.length) {
      if (requireWallet) {
        throw new WalletConnectError('rejected', 'No account was shared by your wallet.');
      }
      return SANDBOX_WALLET;
    }

    const address = accounts[0];
    const [balance, network] = await Promise.all([
      provider.getBalance(address),
      provider.getNetwork(),
    ]);
    const symbol =
      Number(network.chainId) === 43113 || Number(network.chainId) === 43114 ? 'AVAX' : 'ETH';
    const formattedBalance = `${parseFloat(ethers.formatEther(balance)).toFixed(3)} ${symbol}`;
    const providerName = detectProviderName(injected);

    return {
      isConnected: true,
      address,
      shortAddress: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      avaxBalance: formattedBalance,
      networkName: networkLabel(network.chainId),
      isSandbox: false,
      providerName,
    };
  } catch (e) {
    if (e instanceof WalletConnectError) {
      if (requireWallet) throw e;
      return SANDBOX_WALLET;
    }
    const code = (e as { code?: number })?.code;
    if (code === 4001) {
      const rejected = new WalletConnectError('rejected', 'Wallet connection was cancelled.');
      if (requireWallet) throw rejected;
      return SANDBOX_WALLET;
    }
    console.warn('Web3 Wallet connection declined or error:', e);
    if (requireWallet) {
      throw new WalletConnectError(
        'unknown',
        'Could not connect your wallet. Unlock Core or MetaMask and try again.'
      );
    }
    return SANDBOX_WALLET;
  }
}

export function getWalletErrorMessage(error: unknown): string {
  if (error instanceof WalletConnectError) return error.message;
  return 'Could not connect your wallet. Try Core or MetaMask and try again.';
}

export function computeKeccakProof(payloadString: string): string {
  try {
    return ethers.id(payloadString);
  } catch {
    return '0x' + Math.random().toString(16).substring(2).padEnd(64, '0');
  }
}
