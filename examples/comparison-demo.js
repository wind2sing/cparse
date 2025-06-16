/**
 * 语法对比演示
 * 展示传统语法 vs 简化语法的差异
 */

const { loadCheerio, parse } = require('../index.js');

// 示例 HTML
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>语法对比演示</title>
</head>
<body>
    <div class="container">
        <h1 class="title">cparse 语法对比</h1>
        <p class="description">展示传统语法与简化语法的差异</p>
        
        <div class="product-list">
            <div class="product" data-id="1">
                <h3 class="name">iPhone 15</h3>
                <span class="price">$999.00</span>
                <div class="rating" data-score="4.5">★★★★☆</div>
                <div class="tags">
                    <span class="tag">手机</span>
                    <span class="tag">苹果</span>
                    <span class="tag">5G</span>
                </div>
            </div>
            
            <div class="product" data-id="2">
                <h3 class="name">MacBook Pro</h3>
                <span class="price">$1999.00</span>
                <div class="rating" data-score="4.8">★★★★★</div>
                <div class="tags">
                    <span class="tag">笔记本</span>
                    <span class="tag">苹果</span>
                    <span class="tag">M3</span>
                </div>
            </div>
        </div>
        
        <div class="stats">
            <span class="total-products">2</span>
            <span class="avg-rating">4.65</span>
        </div>
    </div>
</body>
</html>
`;

const $ = loadCheerio(html);

console.log('=== cparse 语法对比演示 ===\n');

// 1. 基本选择器对比
console.log('1. 基本选择器对比:');
console.log('传统语法: parse(\'.title\', $)');
console.log('简化语法: $.parse(\'.title\')');
console.log('结果:', $.parse('.title'));
console.log('');

// 2. 属性提取对比
console.log('2. 属性提取对比:');
console.log('传统语法: parse(\'[.product@data-id]\', $)');
console.log('简化语法: $.parse(\'[.product@data-id]\')');
console.log('结果:', $.parse('[.product@data-id]'));
console.log('');

// 3. 过滤器链对比
console.log('3. 过滤器链对比:');
console.log('传统语法: parse(\'.price | regex:\\\\d+\\\\.\\\\d+ | float\', $)');
console.log('简化语法: $.parse(\'.price | regex:\\\\d+\\\\.\\\\d+ | float\')');
console.log('结果:', $.parse('.price | regex:\\d+\\.\\d+ | float'));
console.log('');

// 4. 数组提取对比
console.log('4. 数组提取对比:');
console.log('传统语法: parse(\'[.tag]\', $)');
console.log('简化语法: $.parse(\'[.tag]\')');
console.log('结果:', $.parse('[.tag]'));
console.log('');

// 5. 结构化数据对比
console.log('5. 结构化数据对比:');
console.log('传统语法:');
console.log('parse({');
console.log('  title: \'.title\',');
console.log('  products: \'[.product]\',');
console.log('  totalProducts: \'.total-products | int\'');
console.log('}, $)');
console.log('');
console.log('简化语法:');
console.log('$.parse({');
console.log('  title: \'.title\',');
console.log('  products: \'[.product]\',');
console.log('  totalProducts: \'.total-products | int\'');
console.log('})');
console.log('');

const basicData = $.parse({
  title: '.title',
  products: '[.product .name]',
  totalProducts: '.total-products | int'
});

console.log('结果:', JSON.stringify(basicData, null, 2));
console.log('');

// 6. 复杂结构化数据对比
console.log('6. 复杂结构化数据对比:');
console.log('使用分割器语法提取产品详情...');

// 传统语法（仍然支持）
const traditionalResult = parse([
  '.product',
  {
    id: '@data-id | int',
    name: '.name',
    price: '.price | regex:\\d+\\.\\d+ | float',
    rating: '.rating@data-score | float',
    tags: ['.tags .tag', 'text']
  }
], $);

// 简化语法
const simplifiedResult = $.parse([
  '.product',
  {
    id: '@data-id | int',
    name: '.name',
    price: '.price | regex:\\d+\\.\\d+ | float',
    rating: '.rating@data-score | float',
    tags: ['.tags .tag', 'text']
  }
]);

console.log('传统语法结果:', JSON.stringify(traditionalResult, null, 2));
console.log('');
console.log('简化语法结果:', JSON.stringify(simplifiedResult, null, 2));
console.log('');

// 7. 性能对比
console.log('7. 性能对比:');
const iterations = 1000;

// 传统语法性能测试
console.time('传统语法性能');
for (let i = 0; i < iterations; i++) {
  parse('.title', $);
  parse('[.product .name]', $);
  parse('.price | float', $);
}
console.timeEnd('传统语法性能');

// 简化语法性能测试
console.time('简化语法性能');
for (let i = 0; i < iterations; i++) {
  $.parse('.title');
  $.parse('[.product .name]');
  $.parse('.price | float');
}
console.timeEnd('简化语法性能');

console.log('');

// 8. 代码简洁性对比
console.log('8. 代码简洁性对比:');
console.log('');
console.log('❌ 传统语法 - 需要重复传递 $ 参数:');
console.log('const title = parse(\'.title\', $);');
console.log('const products = parse(\'[.product .name]\', $);');
console.log('const prices = parse(\'[.price | float]\', $);');
console.log('const data = parse({ title: \'.title\', count: \'.count | int\' }, $);');
console.log('');
console.log('✅ 简化语法 - 更简洁直观:');
console.log('const title = $.parse(\'.title\');');
console.log('const products = $.parse(\'[.product .name]\');');
console.log('const prices = $.parse(\'[.price | float]\');');
console.log('const data = $.parse({ title: \'.title\', count: \'.count | int\' });');

console.log('\n=== 演示完成 ===');
console.log('\n💡 总结:');
console.log('- 简化语法减少了重复的 $ 参数传递');
console.log('- 代码更简洁、更直观');
console.log('- 性能基本相同');
console.log('- 完全向后兼容，传统语法仍然支持');
console.log('- 推荐在新项目中使用简化语法');
