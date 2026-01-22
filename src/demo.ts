import dotenv from 'dotenv';
import { newTokenListener } from './services/newTokenListener';
import { tokenDataService } from './services/tokenDataService';
import { smartMoneyTracker } from './services/smartMoneyTracker';

dotenv.config();

/**
 * TweetAlpha 完整演示
 * 展示三个核心服务的协同工作
 */
async function runDemo() {
  console.log('🚀 TweetAlpha - Alpha Radar 启动中...\n');
  console.log('='.repeat(70));

  // ========== 1. 初始化聪明钱追踪 ==========
  console.log('\n🐋 步骤1: 初始化聪明钱数据库');
  console.log('-'.repeat(70));
  
  // 添加一些已知的活跃钱包地址（示例）
  const knownWallets = [
    'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg',
    // 可以添加更多已知的聪明钱地址
  ];

  console.log(`正在分析 ${knownWallets.length} 个钱包...`);
  for (const wallet of knownWallets) {
    await smartMoneyTracker.analyzeWallet(wallet);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 避免限流
  }

  const smartWallets = smartMoneyTracker.getSmartWallets();
  console.log(`\n✅ 聪明钱数据库初始化完成，当前追踪 ${smartWallets.length} 个聪明钱`);

  // ========== 2. 启动新币监听 ==========
  console.log('\n🆕 步骤2: 启动新币监听器');
  console.log('-'.repeat(70));

  newTokenListener.onNewToken(async (token) => {
    console.log(`\n🎯 发现新代币: ${token.symbol}`);
    console.log(`   名称: ${token.name}`);
    console.log(`   地址: ${token.tokenAddress}`);
    console.log(`   流动性: $${token.initialLiquidity?.toFixed(2) || 0}`);

    // 获取代币详细数据
    console.log(`   正在获取价格数据...`);
    const tokenData = await tokenDataService.getTokenData(token.tokenAddress);
    
    if (tokenData) {
      console.log(`   ✅ 价格: $${tokenData.price.toFixed(6)}`);
      console.log(`   ✅ 市值: $${(tokenData.marketCap / 1000).toFixed(2)}K`);
      console.log(`   ✅ 24h交易量: $${(tokenData.volume24h / 1000).toFixed(2)}K`);
    }

    // TODO: 检查是否有聪明钱买入
    console.log(`   🔍 检查聪明钱动态...`);
  });

  newTokenListener.pollNewTokens();
  console.log('✅ 新币监听器已启动（每5秒检查一次）');

  // ========== 3. 启动聪明钱监控 ==========
  console.log('\n👀 步骤3: 启动聪明钱交易监控');
  console.log('-'.repeat(70));

  smartMoneyTracker.onSmartMoneyTrade((trade) => {
    console.log(`\n🚨 聪明钱交易提醒!`);
    console.log(`   钱包: ${trade.wallet.slice(0, 12)}...`);
    console.log(`   操作: ${trade.action.toUpperCase()}`);
    console.log(`   代币: ${trade.tokenSymbol}`);
    console.log(`   时间: ${trade.timestamp.toLocaleString()}`);
    console.log(`   交易哈希: ${trade.txSignature.slice(0, 12)}...`);
  });

  smartMoneyTracker.startMonitoring();
  console.log('✅ 聪明钱监控已启动（每30秒检查一次）');

  // ========== 4. 系统运行状态 ==========
  console.log('\n' + '='.repeat(70));
  console.log('✅ TweetAlpha 所有服务已启动！');
  console.log('='.repeat(70));
  console.log('\n📊 实时监控中...');
  console.log('   🆕 新币监听: 运行中');
  console.log('   🐋 聪明钱追踪: 运行中');
  console.log('   📈 数据分析: 就绪');
  console.log('\n按 Ctrl+C 停止服务\n');

  // 保持运行
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  正在停止服务...');
    newTokenListener.stop();
    smartMoneyTracker.stop();
    console.log('✅ 所有服务已停止');
    process.exit(0);
  });
}

// 启动演示
runDemo().catch((error) => {
  console.error('❌ 启动失败:', error);
  process.exit(1);
});
