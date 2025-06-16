/**
 * 网页抓取示例
 * 演示如何使用 cparse 进行实际的网页数据抓取
 */

const { loadCheerio, parse } = require('../index.js');

// 模拟一个电商产品页面
const productPageHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>商品详情 - 在线商城</title>
</head>
<body>
    <div class="product-page">
        <div class="breadcrumb">
            <a href="/">首页</a> > 
            <a href="/electronics">电子产品</a> > 
            <a href="/phones">手机</a> > 
            <span>iPhone 15 Pro</span>
        </div>
        
        <div class="product-info">
            <h1 class="product-title">Apple iPhone 15 Pro 128GB 深空黑色</h1>
            <div class="price-section">
                <span class="current-price">¥7,999.00</span>
                <span class="original-price">¥8,999.00</span>
                <span class="discount">-11%</span>
            </div>
            
            <div class="product-specs">
                <div class="spec-item">
                    <span class="spec-label">存储容量:</span>
                    <span class="spec-value">128GB</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">颜色:</span>
                    <span class="spec-value">深空黑色</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">屏幕尺寸:</span>
                    <span class="spec-value">6.1英寸</span>
                </div>
            </div>
            
            <div class="rating-section">
                <div class="rating" data-score="4.5">
                    <span class="stars">★★★★☆</span>
                    <span class="score">4.5</span>
                </div>
                <span class="review-count">(1,234 条评价)</span>
            </div>
            
            <div class="availability">
                <span class="stock-status in-stock">现货</span>
                <span class="shipping">免费配送</span>
            </div>
        </div>
        
        <div class="reviews">
            <h3>用户评价</h3>
            <div class="review-item">
                <div class="reviewer">张三</div>
                <div class="review-rating" data-score="5">★★★★★</div>
                <div class="review-text">非常好的手机，性能强劲，拍照效果很棒！</div>
                <div class="review-date">2024-01-15</div>
            </div>
            <div class="review-item">
                <div class="reviewer">李四</div>
                <div class="review-rating" data-score="4">★★★★☆</div>
                <div class="review-text">整体不错，就是价格有点贵。</div>
                <div class="review-date">2024-01-10</div>
            </div>
            <div class="review-item">
                <div class="reviewer">王五</div>
                <div class="review-rating" data-score="5">★★★★★</div>
                <div class="review-text">苹果的品质一如既往的好，推荐购买！</div>
                <div class="review-date">2024-01-08</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

console.log('=== 网页抓取示例 ===\n');

const $ = loadCheerio(productPageHtml);

// 1. 提取基本产品信息
console.log('1. 基本产品信息:');
const basicInfo = parse({
    title: '.product-title',
    currentPrice: '.current-price | slice:1: | float',
    originalPrice: '.original-price | slice:1: | float',
    discount: '.discount | slice:1:-1 | int',
    inStock: '.stock-status.in-stock | bool'
}, $);

console.log(JSON.stringify(basicInfo, null, 2));

// 2. 提取产品规格
console.log('\n2. 产品规格:');
const specs = parse([
    '[.spec-item]',
    {
        label: '.spec-label | slice:0:-1',  // 去掉冒号
        value: '.spec-value'
    }
], $);

console.log(JSON.stringify(specs, null, 2));

// 3. 提取评分信息
console.log('\n3. 评分信息:');
const rating = parse({
    score: '.rating@data-score | float',
    reviewCount: '.review-count | slice:1:-4 | int'  // 提取数字部分
}, $);

console.log(JSON.stringify(rating, null, 2));

// 4. 提取用户评价
console.log('\n4. 用户评价:');
const reviews = parse([
    '[.review-item]',
    {
        reviewer: '.reviewer',
        rating: '.review-rating@data-score | int',
        text: '.review-text',
        date: '.review-date'
    }
], $);

console.log(JSON.stringify(reviews, null, 2));

// 5. 综合产品数据
console.log('\n5. 完整产品数据:');
const productData = parse({
    // 基本信息
    title: '.product-title',
    price: {
        current: '.current-price | slice:1: | float',
        original: '.original-price | slice:1: | float',
        discount: '.discount | slice:1:-1 | int'
    },
    
    // 规格参数
    specs: [
        '[.spec-item]',
        {
            label: '.spec-label | slice:0:-1',
            value: '.spec-value'
        }
    ],
    
    // 评分
    rating: {
        score: '.rating@data-score | float',
        count: '.review-count | slice:1:-4 | int'
    },
    
    // 库存状态
    availability: {
        inStock: '.stock-status.in-stock | bool',
        freeShipping: '.shipping | bool'
    },
    
    // 评价列表
    reviews: [
        '[.review-item]',
        {
            reviewer: '.reviewer',
            rating: '.review-rating@data-score | int',
            text: '.review-text',
            date: '.review-date'
        }
    ]
}, $);

console.log(JSON.stringify(productData, null, 2));

console.log('\n=== 抓取完成 ===');
