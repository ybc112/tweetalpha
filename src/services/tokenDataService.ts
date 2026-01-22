import axios from 'axios';
import { TokenData } from '../types';

class TokenDataService {
  // 使用 DexScreener 免费API（无需API Key）
  private dexScreenerBase = 'https://api.dexscreener.com/latest/dex';

  // 获取代币基本信息和价格
  async getTokenData(tokenAddress: string): Promise<TokenData | null> {
    try {
      console.log(`📊 获取代币数据: ${tokenAddress.slice(0, 8)}...`);
      
      const response = await axios.get(
        `${this.dexScreenerBase}/tokens/${tokenAddress}`
      );

      const pairs = response.data.pairs;
      
      if (!pairs || pairs.length === 0) {
        console.log(`⚠️  未找到代币数据: ${tokenAddress}`);
        return null;
      }

      // 取流动性最高的交易对
      const mainPair = pairs.sort((a: any, b: any) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0];

      const tokenData: TokenData = {
        address: tokenAddress,
        name: mainPair.baseToken.name || 'Unknown',
        symbol: mainPair.baseToken.symbol || '???',
        price: parseFloat(mainPair.priceUsd || '0'),
        priceChange24h: parseFloat(mainPair.priceChange?.h24 || '0'),
        marketCap: mainPair.marketCap || 0,
        liquidity: mainPair.liquidity?.usd || 0,
        holders: 0, // DexScreener不提供持有者数据
        volume24h: mainPair.volume?.h24 || 0,
        topHolders: []
      };

      console.log(`✅ ${tokenData.symbol}: $${tokenData.price.toFixed(6)} (${tokenData.priceChange24h > 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%)`);

      return tokenData;
    } catch (error: any) {
      console.error(`❌ 获取代币数据失败 ${tokenAddress}:`, error.message);
      return null;
    }
  }

  // 获取多个代币数据（批量）
  async getMultipleTokensData(tokenAddresses: string[]): Promise<TokenData[]> {
    const results = await Promise.all(
      tokenAddresses.map(addr => this.getTokenData(addr))
    );
    return results.filter(data => data !== null) as TokenData[];
  }

  // 获取代币价格历史（使用DexScreener）
  async getPriceHistory(tokenAddress: string) {
    try {
      // DexScreener 不直接提供历史数据API
      // 可以通过实时数据自己记录历史
      console.log(`📈 价格历史功能需要自己记录数据`);
      return [];
    } catch (error: any) {
      console.error('❌ 获取价格历史失败:', error.message);
      return [];
    }
  }

  // 使用 Helius 获取代币持有者分布
  async getTopHolders(tokenAddress: string, limit: number = 10) {
    try {
      const response = await axios.post(
        `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenLargestAccounts',
          params: [tokenAddress]
        }
      );

      const accounts = response.data.result?.value || [];
      
      return accounts.slice(0, limit).map((acc: any, index: number) => ({
        address: acc.address,
        percentage: 0 // 需要总供应量才能计算百分比
      }));
    } catch (error: any) {
      console.error('❌ 获取持有者失败:', error.message);
      return [];
    }
  }

  // 搜索代币（通过名称或符号）
  async searchTokens(query: string) {
    try {
      const response = await axios.get(
        `${this.dexScreenerBase}/search?q=${encodeURIComponent(query)}`
      );
      
      return response.data.pairs || [];
    } catch (error: any) {
      console.error('❌ 搜索代币失败:', error.message);
      return [];
    }
  }
}

export const tokenDataService = new TokenDataService();
