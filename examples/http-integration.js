/**
 * HTTP 客户端集成示例
 * 演示如何将 cparse 与 Axios 和 Got 集成使用
 */

const { cheerioHookForAxios, parse } = require('../index.js');

// 注意：这个示例需要安装 axios
// npm install axios

// 模拟服务器响应
function mockServer() {
    const http = require('http');
    
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        
        if (req.url === '/news') {
            res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>新闻列表</title>
</head>
<body>
    <div class="news-list">
        <article class="news-item">
            <h2 class="title">科技新闻：AI技术取得重大突破</h2>
            <div class="meta">
                <span class="author">张记者</span>
                <span class="date">2024-01-15</span>
                <span class="category">科技</span>
            </div>
            <p class="summary">人工智能领域再次取得重大突破，新算法效率提升50%...</p>
            <a href="/news/1" class="read-more">阅读全文</a>
        </article>
        
        <article class="news-item">
            <h2 class="title">经济动态：股市创新高</h2>
            <div class="meta">
                <span class="author">李记者</span>
                <span class="date">2024-01-14</span>
                <span class="category">经济</span>
            </div>
            <p class="summary">今日股市表现强劲，主要指数均创历史新高...</p>
            <a href="/news/2" class="read-more">阅读全文</a>
        </article>
        
        <article class="news-item">
            <h2 class="title">体育赛事：冬奥会筹备进展顺利</h2>
            <div class="meta">
                <span class="author">王记者</span>
                <span class="date">2024-01-13</span>
                <span class="category">体育</span>
            </div>
            <p class="summary">冬奥会各项筹备工作进展顺利，场馆建设已基本完成...</p>
            <a href="/news/3" class="read-more">阅读全文</a>
        </article>
    </div>
</body>
</html>
            `);
        } else {
            res.end('<h1>404 Not Found</h1>');
        }
    });
    
    return server;
}

async function axiosExample() {
    console.log('=== Axios 集成示例 ===\n');
    
    try {
        // 检查是否安装了 axios
        const axios = require('axios');
        
        // 创建 axios 实例
        const client = axios.create({
            timeout: 5000
        });
        
        // 添加 cheerio 支持
        cheerioHookForAxios(client);
        
        // 启动模拟服务器
        const server = mockServer();
        server.listen(3000, () => {
            console.log('模拟服务器启动在 http://localhost:3000');
        });
        
        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 发送请求
        console.log('发送请求到 /news...');
        const response = await client.get('http://localhost:3000/news');
        
        console.log('响应状态:', response.status);
        console.log('响应包含 $ 属性:', !!response.$);
        
        if (response.$) {
            // 使用 cheerio 解析响应
            const $ = response.$;
            
            // 提取新闻列表
            const newsList = parse([
                '[.news-item]',
                {
                    title: '.title',
                    author: '.author',
                    date: '.date',
                    category: '.category',
                    summary: '.summary',
                    link: '.read-more@href'
                }
            ], $);
            
            console.log('\n提取的新闻列表:');
            console.log(JSON.stringify(newsList, null, 2));
            
            // 统计信息
            const stats = {
                totalNews: newsList.length,
                categories: [...new Set(newsList.map(news => news.category))],
                authors: [...new Set(newsList.map(news => news.author))]
            };
            
            console.log('\n统计信息:');
            console.log(JSON.stringify(stats, null, 2));
        }
        
        // 关闭服务器
        server.close();
        console.log('\n模拟服务器已关闭');
        
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.log('请先安装 axios: npm install axios');
        } else {
            console.error('错误:', error.message);
        }
    }
}

// 运行示例
if (require.main === module) {
    axiosExample().then(() => {
        console.log('\n=== 示例完成 ===');
    }).catch(console.error);
}

module.exports = { axiosExample };
