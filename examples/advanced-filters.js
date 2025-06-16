/**
 * 高级过滤器示例
 * 演示 cparse 中各种过滤器的使用方法
 */

const { loadCheerio, parse } = require('../index.js');

// 示例 HTML 数据
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>过滤器测试页面</title>
</head>
<body>
    <div class="data-examples">
        <!-- 数字数据 -->
        <div class="numbers">
            <span class="price">  $123.45  </span>
            <span class="quantity">50件</span>
            <span class="percentage">85%</span>
            <span class="score">4.8分</span>
        </div>
        
        <!-- 文本数据 -->
        <div class="texts">
            <p class="description">  这是一个很棒的产品，值得推荐！  </p>
            <p class="code">ABC123XYZ</p>
            <p class="reversed">olleh</p>
        </div>
        
        <!-- 日期数据 -->
        <div class="dates">
            <span class="publish-date">2024-01-15</span>
            <span class="update-time">2024/01/15 14:30:25</span>
            <span class="iso-date">2024-01-15T14:30:25Z</span>
        </div>
        
        <!-- 尺寸数据 -->
        <div class="sizes">
            <span class="file-size">1.5MB</span>
            <span class="disk-space">256 GB</span>
            <span class="memory">8GB</span>
        </div>
        
        <!-- 布尔数据 -->
        <div class="flags">
            <span class="active">true</span>
            <span class="enabled">yes</span>
            <span class="visible">1</span>
            <span class="disabled"></span>
        </div>
    </div>
</body>
</html>
`;

console.log('=== 高级过滤器示例 ===\n');

const $ = loadCheerio(html);

// 1. 数字过滤器
console.log('1. 数字过滤器:');

// int 过滤器 - 提取整数
const quantity = parse('.quantity | int', $);
console.log('   数量 (int):', quantity, typeof quantity);

const percentage = parse('.percentage | int', $);
console.log('   百分比 (int):', percentage, typeof percentage);

// float 过滤器 - 提取浮点数
const price = parse('.price | trim | slice:1: | float', $);
console.log('   价格 (float):', price, typeof price);

const score = parse('.score | float', $);
console.log('   评分 (float):', score, typeof score);

// 2. 字符串过滤器
console.log('\n2. 字符串过滤器:');

// trim 过滤器 - 去除首尾空白
const description = parse('.description | trim', $);
console.log('   描述 (trim):', `"${description}"`);

// slice 过滤器 - 字符串切片
const codePrefix = parse('.code | slice:0:3', $);
console.log('   代码前缀 (slice:0:3):', codePrefix);

const codeSuffix = parse('.code | slice:-3:', $);
console.log('   代码后缀 (slice:-3:):', codeSuffix);

// reverse 过滤器 - 字符串反转
const reversed = parse('.reversed | reverse', $);
console.log('   反转文本 (reverse):', reversed);

// 3. 日期过滤器
console.log('\n3. 日期过滤器:');

// date 过滤器 - 解析日期
const publishDate = parse('.publish-date | date', $);
console.log('   发布日期 (date):', publishDate);

const updateTime = parse('.update-time | date', $);
console.log('   更新时间 (date):', updateTime);

const isoDate = parse('.iso-date | date', $);
console.log('   ISO日期 (date):', isoDate);

// 4. 尺寸过滤器
console.log('\n4. 尺寸过滤器:');

const fileSize = parse('.file-size | size', $);
console.log('   文件大小 (size):', fileSize);

const diskSpace = parse('.disk-space | size', $);
console.log('   磁盘空间 (size):', diskSpace);

const memory = parse('.memory | size', $);
console.log('   内存大小 (size):', memory);

// 5. 布尔过滤器
console.log('\n5. 布尔过滤器:');

const active = parse('.active | bool', $);
console.log('   激活状态 (bool):', active, typeof active);

const enabled = parse('.enabled | bool', $);
console.log('   启用状态 (bool):', enabled, typeof enabled);

const visible = parse('.visible | bool', $);
console.log('   可见状态 (bool):', visible, typeof visible);

const disabled = parse('.disabled | bool', $);
console.log('   禁用状态 (bool):', disabled, typeof disabled);

// 6. 过滤器链组合
console.log('\n6. 过滤器链组合:');

// 复杂的过滤器链
const processedPrice = parse('.price | trim | slice:1: | float', $);
console.log('   处理后价格:', processedPrice);

const processedCode = parse('.code | slice:3:6 | reverse', $);
console.log('   处理后代码:', processedCode);

// 7. 批量处理
console.log('\n7. 批量处理:');

const allNumbers = parse('[.numbers span | int]', $);
console.log('   所有数字:', allNumbers);

const allTexts = parse('[.texts p | trim]', $);
console.log('   所有文本:', allTexts);

// 8. 结构化数据处理
console.log('\n8. 结构化数据处理:');

const processedData = parse({
    pricing: {
        amount: '.price | trim | slice:1: | float',
        quantity: '.quantity | int',
        percentage: '.percentage | int'
    },
    content: {
        description: '.description | trim',
        code: '.code',
        reversed: '.reversed | reverse'
    },
    timestamps: {
        published: '.publish-date | date',
        updated: '.update-time | date'
    },
    storage: {
        fileSize: '.file-size | size',
        diskSpace: '.disk-space | size'
    },
    flags: {
        active: '.active | bool',
        enabled: '.enabled | bool',
        visible: '.visible | bool'
    }
}, $);

console.log('   结构化数据:');
console.log(JSON.stringify(processedData, null, 2));

console.log('\n=== 示例完成 ===');
