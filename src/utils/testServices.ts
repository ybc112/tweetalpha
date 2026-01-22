import dotenv from 'dotenv';
import { newTokenListener } from '../services/newTokenListener';
import { tokenDataService } from '../services/tokenDataService';
import { smartMoneyTracker } from '../services/smartMoneyTracker';

dotenv.config();

async function testAllServices() {
  console.log('🧪 测试所有数据采集服务\n');
  console.log('='.repeat(60));

  // ========== 测试1: 代币数据服务 ==========
  console.log('\n📊 测试1: 代币数据服务');
  console.log('-'.repeat(60));
  
  // 测试获取 SOL 数据
  const solAddress = 'So11111111111111111111111111111111111111112';
  const solData = await tokenDataService.getTokenData(solAddress);
  
  if (solData) {
    console.log(`✅ 成功获取 SOL 数据:`);
    console.log(`   价格: $${solData.price.toFixed(2)}`);
    console.log(`   24h涨跌: ${solData.priceChange24h > 0 ? '+' : ''}${solData.priceChange24h.toFixed(2)}%`);
    console.log(`   市值: $${(solData.marketCap / 1e9).toFixed(2)}B`);
    console.log(`   流动性: $${(solData.liquidity / 1e6).toFixed(2)}M`);
  }

  // ========== 测试2: 聪明钱追踪服务 ==========
  console.log('\n🐋 测试2: 聪明钱追踪服务');
  console.log('-'.repeat(60));
  
  // 测试分析一些知名钱包（示例地址）
  const testWallets = [
    'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg', // Helius 示例地址
  ];

  for (const wallet of testWallets) {
    const profile = await smartMoneyTracker.analyzeWallet(wallet);
    console.log(`\n钱包分析结果:`);
    console.log(`   地址: ${profile.address.slice(0, 12)}...`);
    console.log(`   胜率: ${(profile.winRate * 100).toFixed(1)}%`);
    console.log(`   总交易: ${profile.totalTrades}次`);
    console.log(`   平均收益: ${profile.avgProfit.toFixed(2)}%`);
    console.log(`   是否聪明钱: ${profile.isSmartMoney ? '✅ 是' : '❌ 否'}`);
    
    // 等待1秒避免API限流
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const smartWallets = smartMoneyTracker.getSmartWallets();
  console.log(`\n📋 当前追踪的聪明钱数量: ${smartWallets.length}`);

  // ========== 测试3: 新币监听服务 ==========
  console.log('\n🆕 测试3: 新币监听服务');
  console.log('-'.repeat(60));
  console.log('开始监听新代币（将运行10秒）...\n');

  // 注册新币回调
  newTokenListener.onNewToken((token) => {
    console.log(`\n🎉 捕获到新代币!`);
    console.log(`   名称: ${token.name} (${token.symbol})`);
    console.log(`   地址: ${token.tokenAddress}`);
    console.log(`   创建时间: ${token.createdAt.toLocaleString()}`);
    console.log(`   初始流动性: $${token.initialLiquidity?.toFixed(2) || 0}`);
  });

  // 启动轮询
  newTokenListener.pollNewTokens();

  // 运行10秒后停止
  await new Promise(resolve => setTimeout(resolve, 10000));
  newTokenListener.stop();

  console.log('\n' + '='.repeat(60));
  console.log('✅ 所有服务测试完成！');
  console.log('='.repeat(60));

  // ========== 测试4: 聪明钱监控（可选） ==========
  console.log('\n👀 测试4: 启动聪明钱实时监控（可选）');
  console.log('如需测试实时监控，取消下面的注释：');
  console.log('// smartMoneyTracker.startMonitoring();');
  
  process.exit(0);
}

// 运行测试
testAllServices().catch((error) => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
