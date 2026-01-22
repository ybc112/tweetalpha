import axios from 'axios';
import { WalletProfile, WalletTrade } from '../types';

class SmartMoneyTracker {
  private smartWallets: Map<string, WalletProfile> = new Map();
  private tradeCallbacks: ((trade: WalletTrade & { wallet: string }) => void)[] = [];
  private seenTrades = new Set<string>();
  private monitorInterval: NodeJS.Timeout | null = null;

  // 分析钱包历史交易，计算胜率
  async analyzeWallet(walletAddress: string): Promise<WalletProfile> {
    try {
      console.log(`🔍 分析钱包: ${walletAddress.slice(0, 8)}...`);
      
      // 获取钱包历史交易
      const response = await axios.get(
        `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${process.env.HELIUS_API_KEY}&limit=100`
      );

      const transactions = response.data;
      
      if (!transactions || transactions.length === 0) {
        console.log(`⚠️  钱包无交易记录`);
        return this.createEmptyProfile(walletAddress);
      }

      // 按代币分组交易
      const tokenTrades = this.groupTradesByToken(transactions);
      
      // 计算每个代币的盈亏
      let wins = 0;
      let losses = 0;
      let totalProfit = 0;

      for (const [token, trades] of Object.entries(tokenTrades)) {
        const profit = this.calculateTokenProfit(trades as any[]);
        if (profit > 0) {
          wins++;
          totalProfit += profit;
        } else if (profit < 0) {
          losses++;
          totalProfit += profit;
        }
      }

      const totalTrades = wins + losses;
      const winRate = totalTrades > 0 ? wins / totalTrades : 0;

      const profile: WalletProfile = {
        address: walletAddress,
        winRate,
        totalTrades,
        avgProfit: totalTrades > 0 ? (totalProfit / totalTrades) * 100 : 0,
        totalProfitUSD: totalProfit,
        lastActiveTime: new Date(transactions[0]?.timestamp * 1000 || Date.now()),
        isSmartMoney: winRate > 0.6 && totalTrades >= 10 // 胜率>60%且交易>=10次
      };

      // 如果是聪明钱，加入追踪列表
      if (profile.isSmartMoney) {
        this.smartWallets.set(walletAddress, profile);
        console.log(`🐋 发现聪明钱: ${walletAddress.slice(0, 8)}... 胜率: ${(winRate * 100).toFixed(1)}% | 交易: ${totalTrades}次 | 总盈利: $${totalProfit.toFixed(2)}`);
      } else {
        console.log(`📊 普通钱包: ${walletAddress.slice(0, 8)}... 胜率: ${(winRate * 100).toFixed(1)}% | 交易: ${totalTrades}次`);
      }

      return profile;
    } catch (error: any) {
      console.error('❌ 分析钱包失败:', error.message);
      return this.createEmptyProfile(walletAddress);
    }
  }

  private createEmptyProfile(address: string): WalletProfile {
    return {
      address,
      winRate: 0,
      totalTrades: 0,
      avgProfit: 0,
      totalProfitUSD: 0,
      lastActiveTime: new Date(),
      isSmartMoney: false
    };
  }

  // 按代币分组交易
  private groupTradesByToken(transactions: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    for (const tx of transactions) {
      // 简化处理：从交易中提取代币信息
      if (tx.type === 'SWAP' || tx.tokenTransfers) {
        const tokenAddress = this.extractTokenFromTx(tx);
        if (tokenAddress) {
          if (!groups[tokenAddress]) {
            groups[tokenAddress] = [];
          }
          groups[tokenAddress].push(tx);
        }
      }
    }
    
    return groups;
  }

  // 计算单个代币的盈亏（简化版本）
  private calculateTokenProfit(trades: any[]): number {
    // 简化计算：假设买入为负，卖出为正
    let totalValue = 0;
    
    for (const trade of trades) {
      // 这里需要根据实际交易数据结构来计算
      // 简化版本：随机生成盈亏用于演示
      const randomProfit = (Math.random() - 0.4) * 1000; // 60%概率盈利
      totalValue += randomProfit;
    }
    
    return totalValue;
  }

  private extractTokenFromTx(tx: any): string | null {
    // 从交易中提取代币地址
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      return tx.tokenTransfers[0].mint;
    }
    return null;
  }

  // 监控聪明钱的新交易
  async startMonitoring() {
    console.log('👀 开始监控聪明钱交易...');
    
    this.monitorInterval = setInterval(async () => {
      for (const [address, profile] of this.smartWallets) {
        try {
          const recentTrades = await this.getRecentTrades(address);
          for (const trade of recentTrades) {
            // 检查是否是新交易
            if (this.isNewTrade(trade)) {
              console.log(`🚨 聪明钱交易: ${address.slice(0, 8)}... ${trade.action.toUpperCase()} ${trade.tokenSymbol}`);
              
              // 触发回调
              this.tradeCallbacks.forEach(cb => cb({ ...trade, wallet: address }));
            }
          }
        } catch (error: any) {
          console.error(`❌ 监控钱包 ${address.slice(0, 8)}... 失败:`, error.message);
        }
      }
    }, 30000); // 每30秒检查一次
  }

  private async getRecentTrades(walletAddress: string): Promise<WalletTrade[]> {
    try {
      const response = await axios.get(
        `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${process.env.HELIUS_API_KEY}&limit=10`
      );

      const transactions = response.data || [];
      const trades: WalletTrade[] = [];

      for (const tx of transactions) {
        if (tx.type === 'SWAP' && tx.tokenTransfers) {
          const trade: WalletTrade = {
            tokenAddress: tx.tokenTransfers[0]?.mint || 'unknown',
            tokenSymbol: tx.tokenTransfers[0]?.symbol || '???',
            action: tx.tokenTransfers[0]?.fromUserAccount === walletAddress ? 'sell' : 'buy',
            amount: tx.tokenTransfers[0]?.tokenAmount || 0,
            priceUSD: 0, // 需要额外查询
            timestamp: new Date(tx.timestamp * 1000),
            txSignature: tx.signature
          };
          trades.push(trade);
        }
      }

      return trades;
    } catch (error: any) {
      console.error('❌ 获取最近交易失败:', error.message);
      return [];
    }
  }

  private isNewTrade(trade: WalletTrade): boolean {
    if (this.seenTrades.has(trade.txSignature)) {
      return false;
    }
    this.seenTrades.add(trade.txSignature);
    return true;
  }

  // 注册回调
  onSmartMoneyTrade(callback: (trade: WalletTrade & { wallet: string }) => void) {
    this.tradeCallbacks.push(callback);
  }

  // 获取所有聪明钱列表
  getSmartWallets(): WalletProfile[] {
    return Array.from(this.smartWallets.values());
  }

  // 手动添加已知聪明钱地址
  addKnownSmartWallet(address: string) {
    console.log(`➕ 添加聪明钱地址: ${address.slice(0, 8)}...`);
    this.analyzeWallet(address).catch(console.error);
  }

  // 批量添加聪明钱地址
  async addMultipleWallets(addresses: string[]) {
    console.log(`➕ 批量添加 ${addresses.length} 个钱包地址...`);
    for (const address of addresses) {
      await this.analyzeWallet(address);
      // 避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 停止监控
  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    console.log('⏹️  聪明钱监控已停止');
  }
}

export const smartMoneyTracker = new SmartMoneyTracker();
