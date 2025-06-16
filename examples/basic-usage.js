/**
 * 基本用法示例
 * 演示如何使用 cparse 进行基本的 HTML 解析和数据提取
 */

const { loadCheerio, parse } = require('../index.js');

// 示例 HTML
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>示例页面</title>
</head>
<body>
    <div class="container">
        <h1 class="title">欢迎使用 cparse</h1>
        <p class="description">一个强大的 HTML 解析工具</p>
        
        <ul class="features">
            <li>简单易用</li>
            <li>功能强大</li>
            <li>高性能</li>
        </ul>
        
        <div class="stats">
            <span class="downloads">1000+</span>
            <span class="stars">50</span>
            <span class="version">1.0.6</span>
        </div>
        
        <a href="/docs" class="link">查看文档</a>
    </div>
</body>
</html>
`;

console.log('=== 基本用法示例 ===\n');

// 1. 加载 HTML
const $ = loadCheerio(html);
console.log('1. 加载 HTML 完成');

// 2. 提取单个元素
const title = parse('.title', $);
console.log('2. 页面标题:', title);

const description = parse('.description', $);
console.log('   页面描述:', description);

// 3. 提取属性
const linkHref = parse('.link@href', $);
console.log('3. 链接地址:', linkHref);

// 4. 提取所有匹配元素
const features = parse('[.features li]', $);
console.log('4. 功能列表:', features);

// 5. 使用过滤器
const downloads = parse('.downloads | int', $);
console.log('5. 下载次数:', downloads, '(类型:', typeof downloads, ')');

const stars = parse('.stars | int', $);
console.log('   星标数量:', stars, '(类型:', typeof stars, ')');

// 6. 提取结构化数据
const pageInfo = parse({
    title: '.title',
    description: '.description',
    features: '[.features li]',
    stats: {
        downloads: '.downloads | int',
        stars: '.stars | int',
        version: '.version'
    },
    link: '.link@href'
}, $);

console.log('\n6. 结构化数据:');
console.log(JSON.stringify(pageInfo, null, 2));

// 7. 使用分割器处理列表
const statsArray = parse([
    '[.stats span]',
    {
        value: 'text',
        class: '@class'
    }
], $);

console.log('\n7. 统计数据数组:');
console.log(JSON.stringify(statsArray, null, 2));

console.log('\n=== 示例完成 ===');
