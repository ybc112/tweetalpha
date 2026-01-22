// 新代币接口
export interface NewToken {
  tokenAddress: string;
  name: string;
  symbol: string;
  createdAt: Date;
  creator: string;
  initialLiquidity?: number;
}

// 代币数据接口
export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  volume24h: number;
  topHolders: { address: string; percentage: number }[];
}

// 钱包画像接口
export interface WalletProfile {
  address: string;
  winRate: number;          // 胜率
  totalTrades: number;      // 总交易数
  avgProfit: number;        // 平均收益率
  totalProfitUSD: number;   // 总盈利(USD)
  lastActiveTime: Date;     // 最后活跃时间
  isSmartMoney: boolean;    // 是否是聪明钱
}

// 钱包交易接口
export interface WalletTrade {
  tokenAddress: string;
  tokenSymbol: string;
  action: 'buy' | 'sell';
  amount: number;
  priceUSD: number;
  timestamp: Date;
  txSignature: string;
}
