import { ethers } from 'ethers';
import { TxRecord } from '../types';

export const AVALANCHE_FUJI_CONFIG = {
  chainId: '0xa869', // 43113
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://subnets-test.avax.network/c-chain'],
};

export const CONTRACT_ADDRESSES = {
  ProofOfAdherence: '0x3F91a823f991129bF013098C21a9952085A651d9',
  HealthCompanionNFT: '0x789C1a082fB2019c018240992a019e09919102A1',
  RewardSponsorPool: '0x9911BcAfE019931089240177265920042a9B109A',
};

export interface WalletState {
  isConnected: boolean;
  address: string;
  shortAddress: string;
  avaxBalance: string;
  networkName: string;
  isSandbox: boolean;
}

export const SANDBOX_WALLET: WalletState = {
  isConnected: true,
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  shortAddress: '0x71C7...976F',
  avaxBalance: '4.85 AVAX',
  networkName: 'Avalanche Fuji C-Chain (43113)',
  isSandbox: true,
};

// Helper to generate realistic Avalanche Tx
export function createAvalancheTxRecord(
  contractName: string,
  method: string,
  eventEmitted: string,
  fromAddr: string = SANDBOX_WALLET.address
): TxRecord {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  const hash = '0x' + Array.from({ length: 64 }, randomHex).join('');
  const blockNumber = 38910000 + Math.floor(Math.random() * 500);
  const contractAddr = CONTRACT_ADDRESSES[contractName as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES.ProofOfAdherence;
  const gas = Math.floor(28000 + Math.random() * 15000);

  return {
    hash,
    blockNumber,
    timestamp: new Date().toLocaleString(),
    from: fromAddr,
    to: contractAddr,
    contractName,
    method,
    status: 'Confirmed',
    gasUsed: gas.toLocaleString(),
    nAvaxFee: (gas * 0.000000025).toFixed(5) + ' AVAX',
    eventEmitted,
    explorersUrl: `${AVALANCHE_FUJI_CONFIG.blockExplorerUrls[0]}/tx/${hash}`,
  };
}

// Check or connect Web3 Wallet (Core Wallet or MetaMask)
export async function connectWeb3Wallet(): Promise<WalletState> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const balance = await provider.getBalance(address);
        const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(3) + ' AVAX';

        return {
          isConnected: true,
          address,
          shortAddress: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          avaxBalance: formattedBalance,
          networkName: 'Avalanche C-Chain',
          isSandbox: false,
        };
      }
    } catch (e) {
      console.warn('Web3 Wallet connection declined or error:', e);
    }
  }

  // Fallback to Sandbox Wallet for smooth testing
  return SANDBOX_WALLET;
}

export function computeKeccakProof(payloadString: string): string {
  try {
    return ethers.id(payloadString);
  } catch {
    return '0x' + Math.random().toString(16).substring(2).padEnd(64, '0');
  }
}
