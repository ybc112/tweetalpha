import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testAllAPIs() {
  console.log('🔍 测试所有API连接...\n');

  // 1. 测试 Helius
  try {
    const heliusRes = await axios.get(
      `https://api.helius.xyz/v0/addresses/vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg/transactions?api-key=${process.env.HELIUS_API_KEY}&limit=1`
    );
    console.log('✅ Helius API 连接成功');
  } catch (e: any) {
    console.log('❌ Helius API 连接失败:', e.message);
  }

  // 2. 测试 Birdeye
  try {
    const birdeyeRes = await axios.get(
      'https://public-api.birdeye.so/defi/price?address=So11111111111111111111111111111111111111112',
      {
        headers: {
          'X-API-KEY': process.env.BIRDEYE_API_KEY,
          'x-chain': 'solana'
        }
      }
    );
    console.log('✅ Birdeye API 连接成功, SOL价格:', birdeyeRes.data.data.value);
  } catch (e: any) {
    console.log('❌ Birdeye API 连接失败:', e.message);
  }

  // 3. 测试 Moralis
  try {
    const moralisRes = await axios.get(
      'https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/new?limit=1',
      {
        headers: {
          'X-API-Key': process.env.MORALIS_API_KEY
        }
      }
    );
    console.log('✅ Moralis API 连接成功, 最新代币:', moralisRes.data.result[0]?.name);
  } catch (e: any) {
    console.log('❌ Moralis API 连接失败:', e.message);
  }

  console.log('\n🎉 API测试完成！');
}

testAllAPIs();
