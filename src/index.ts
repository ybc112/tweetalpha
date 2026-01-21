import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TweetAlpha API is running',
    timestamp: new Date().toISOString()
  });
});

// 欢迎页面
app.get('/', (req, res) => {
  res.json({
    name: 'TweetAlpha',
    description: 'Your Alpha Radar for Trends.fun',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TweetAlpha server running on http://localhost:${PORT}`);
});
