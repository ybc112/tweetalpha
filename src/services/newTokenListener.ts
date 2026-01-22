import WebSocket from 'ws';
import axios from 'axios';
import { NewToken } from '../types';

class NewTokenListener {
  private ws: WebSocket | null = null;
  private callbacks: ((token: NewToken) => void)[] = [];
  private seenTokens = new Set<string>();
  private pollInterval: NodeJS.Timeout | null = null;

  // 方法1: 使用Moralis轮询获取新币（简单可靠）
  async pollNewTokens() {
    console.log('🔄 开始轮询新代币...');
    
    this.pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          'https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/new?limit=20',
          {
            headers: { 'X-API-Key': process.env.MORALIS_API_KEY }
          }
        );
        
        const tokens = response.data.result;
        
        if (!tokens || tokens.length === 0) {
          return;
        }

        for (const token of tokens) {
          // 检查是否是新发现的代币
          if (this.isNewToken(token.tokenAddress)) {
            const newToken: NewToken = {
              tokenAddress: token.tokenAddress,
              name: token.name || 'Unknown',
              symbol: token.symbol || '???',
              createdAt: new Date(token.createdAt || Date.now()),
              creator: token.creator || 'unknown',
              initialLiquidity: token.liquidity ? parseFloat(token.liquidity) : 0
            };
            
            console.log(`🆕 发现新代币: ${newToken.symbol} (${newToken.name})`);
            console.log(`   地址: ${newToken.tokenAddress}`);
            console.log(`   创建者: ${newToken.creator.slice(0, 8)}...`);
            console.log(`   初始流动性: $${newToken.initialLiquidity?.toFixed(2) || 0}`);
            
            // 触发回调
            this.callbacks.forEach(cb => cb(newToken));
          }
        }
      } catch (error: any) {
        console.error('❌ 轮询新代币失败:', error.message);
      }
    }, 5000); // 每5秒检查一次
  }

  // 方法2: 使用Helius WebSocket实时监听（更快但更复杂）
  async startWebSocketListener(programId: string) {
    const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.on('open', () => {
      console.log('🔌 WebSocket已连接');
      
      // 订阅程序日志
      this.ws?.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'logsSubscribe',
        params: [
          { mentions: [programId] },
          { commitment: 'confirmed' }
        ]
      }));
    });

    this.ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.method === 'logsNotification') {
        // 解析日志，提取新代币信息
        this.parseAndEmitToken(parsed.params.result.value);
      }
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket错误:', error);
    });

    this.ws.on('close', () => {
      console.log('🔌 WebSocket连接关闭');
    });
  }

  private isNewToken(tokenAddress: string): boolean {
    if (this.seenTokens.has(tokenAddress)) {
      return false;
    }
    this.seenTokens.add(tokenAddress);
    return true;
  }

  private parseAndEmitToken(logValue: any) {
    // 解析日志提取代币信息的逻辑
    // 这需要根据Trends.fun的具体日志格式来实现
    console.log('📝 收到日志:', logValue);
  }

  // 注册回调
  onNewToken(callback: (token: NewToken) => void) {
    this.callbacks.push(callback);
  }

  // 停止监听
  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('⏹️  新币监听已停止');
  }
}

export const newTokenListener = new NewTokenListener();
