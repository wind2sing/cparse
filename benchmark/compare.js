/**
 * 比较基准测试
 * 比较 cparse 与原生 Cheerio 的性能差异
 */

const cheerio = require('cheerio');
const { loadCheerio, parse } = require('../index.js');

// 测试数据
const testHtml = `
<div class="container">
  <h1 class="title">Test Page</h1>
  <div class="content">
    <p class="description">Some description text here</p>
    <ul class="items">
      <li class="item" data-id="1">
        <span class="name">Item 1</span>
        <span class="price">$10.99</span>
      </li>
      <li class="item" data-id="2">
        <span class="name">Item 2</span>
        <span class="price">$15.50</span>
      </li>
      <li class="item" data-id="3">
        <span class="name">Item 3</span>
        <span class="price">$8.75</span>
      </li>
    </ul>
  </div>
</div>
`;

// 基准测试辅助函数
function measurePerformance(name, fn, iterations = 1000) {
  // 预热
  for (let i = 0; i < 10; i++) {
    fn();
  }
  
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = process.hrtime.bigint();
  const totalTime = Number(end - start) / 1000000;
  const avgTime = totalTime / iterations;
  
  console.log(`${name}: ${avgTime.toFixed(4)}ms per operation`);
  
  return avgTime;
}

function runComparison() {
  console.log('cparse vs Cheerio 性能比较');
  console.log('='.repeat(50));
  
  const results = {};
  
  // HTML 加载比较
  console.log('\n1. HTML 加载性能:');
  
  results.cheerioLoad = measurePerformance('  Cheerio.load', () => {
    cheerio.load(testHtml);
  });
  
  results.cparseLoad = measurePerformance('  cparse.loadCheerio', () => {
    loadCheerio(testHtml);
  });
  
  // 简单选择器比较
  console.log('\n2. 简单选择器性能:');
  
  const $cheerio = cheerio.load(testHtml);
  const $cparse = loadCheerio(testHtml);
  
  results.cheerioSimpleSelect = measurePerformance('  Cheerio $(\'.title\')', () => {
    $cheerio('.title').text();
  });
  
  results.cparseSimpleSelect = measurePerformance('  cparse parse(\'.title\')', () => {
    parse('.title', $cparse);
  });
  
  // 数组提取比较
  console.log('\n3. 数组提取性能:');
  
  results.cheerioArrayExtract = measurePerformance('  Cheerio 数组提取', () => {
    const items = [];
    $cheerio('.item .name').each((_, el) => {
      items.push($cheerio(el).text());
    });
    return items;
  });
  
  results.cparseArrayExtract = measurePerformance('  cparse 数组提取', () => {
    parse('[.item .name]', $cparse);
  });
  
  // 属性提取比较
  console.log('\n4. 属性提取性能:');
  
  results.cheerioAttrExtract = measurePerformance('  Cheerio 属性提取', () => {
    const attrs = [];
    $cheerio('.item').each((_, el) => {
      attrs.push($cheerio(el).attr('data-id'));
    });
    return attrs;
  });
  
  results.cparseAttrExtract = measurePerformance('  cparse 属性提取', () => {
    parse('[.item@data-id]', $cparse);
  });
  
  // 复杂对象提取比较
  console.log('\n5. 复杂对象提取性能:');
  
  results.cheerioComplexExtract = measurePerformance('  Cheerio 复杂提取', () => {
    const result = {
      title: $cheerio('.title').text(),
      description: $cheerio('.description').text(),
      items: []
    };
    
    $cheerio('.item').each((_, el) => {
      const $el = $cheerio(el);
      result.items.push({
        id: parseInt($el.attr('data-id')),
        name: $el.find('.name').text(),
        price: parseFloat($el.find('.price').text().slice(1))
      });
    });
    
    return result;
  }, 100);
  
  results.cparseComplexExtract = measurePerformance('  cparse 复杂提取', () => {
    parse({
      title: '.title',
      description: '.description',
      items: [
        '[.item]',
        {
          id: '@data-id | int',
          name: '.name',
          price: '.price | slice:1: | float'
        }
      ]
    }, $cparse);
  }, 100);
  
  // 计算性能比较
  console.log('\n' + '='.repeat(50));
  console.log('性能比较汇总');
  console.log('='.repeat(50));
  
  const comparisons = [
    {
      name: 'HTML 加载',
      cheerio: results.cheerioLoad,
      cparse: results.cparseLoad
    },
    {
      name: '简单选择器',
      cheerio: results.cheerioSimpleSelect,
      cparse: results.cparseSimpleSelect
    },
    {
      name: '数组提取',
      cheerio: results.cheerioArrayExtract,
      cparse: results.cparseArrayExtract
    },
    {
      name: '属性提取',
      cheerio: results.cheerioAttrExtract,
      cparse: results.cparseAttrExtract
    },
    {
      name: '复杂对象提取',
      cheerio: results.cheerioComplexExtract,
      cparse: results.cparseComplexExtract
    }
  ];
  
  comparisons.forEach(comp => {
    const ratio = comp.cheerio / comp.cparse;
    const faster = ratio > 1 ? 'cparse' : 'Cheerio';
    const speedup = ratio > 1 ? ratio : 1 / ratio;
    
    console.log(`${comp.name.padEnd(15)}: ${faster} 快 ${speedup.toFixed(2)}x`);
    console.log(`  Cheerio: ${comp.cheerio.toFixed(4)}ms`);
    console.log(`  cparse:  ${comp.cparse.toFixed(4)}ms`);
    console.log('');
  });
  
  // 总体评估
  const totalCheerio = comparisons.reduce((sum, comp) => sum + comp.cheerio, 0);
  const totalCparse = comparisons.reduce((sum, comp) => sum + comp.cparse, 0);
  const overallRatio = totalCheerio / totalCparse;
  
  console.log('总体性能:');
  if (overallRatio > 1) {
    console.log(`cparse 总体快 ${overallRatio.toFixed(2)}x`);
  } else {
    console.log(`Cheerio 总体快 ${(1/overallRatio).toFixed(2)}x`);
  }
  
  return {
    timestamp: new Date().toISOString(),
    results,
    comparisons,
    overallRatio
  };
}

// 如果直接运行此文件
if (require.main === module) {
  const report = runComparison();
  
  // 保存报告
  const fs = require('fs');
  const path = require('path');
  
  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `comparison-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`\n比较报告已保存到: ${reportFile}`);
}

module.exports = { runComparison };
