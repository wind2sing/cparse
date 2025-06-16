/**
 * 基础性能基准测试
 * 用于比较不同版本之间的性能差异
 */

const { loadCheerio, parse } = require('../index.js');

// 生成测试数据
function generateTestData() {
  return {
    simple: '<div class="test">Hello World</div>',
    
    medium: `
      <div class="container">
        <h1 class="title">Test Page</h1>
        <div class="content">
          <p class="text">Some content here</p>
          <ul class="list">
            <li class="item">Item 1</li>
            <li class="item">Item 2</li>
            <li class="item">Item 3</li>
          </ul>
        </div>
      </div>
    `,
    
    complex: (() => {
      let html = '<div class="root">';
      for (let i = 0; i < 100; i++) {
        html += `
          <article class="post" data-id="${i}">
            <header class="post-header">
              <h2 class="post-title">Post ${i}</h2>
              <div class="post-meta">
                <span class="author">Author ${i % 10}</span>
                <time class="date">2024-01-${String(i % 28 + 1).padStart(2, '0')}</time>
              </div>
            </header>
            <div class="post-content">
              <p class="excerpt">This is post ${i} excerpt...</p>
              <div class="tags">
                <span class="tag">tag${i % 5}</span>
                <span class="tag">category${i % 3}</span>
              </div>
            </div>
            <footer class="post-footer">
              <div class="stats">
                <span class="views">${Math.floor(Math.random() * 1000)}</span>
                <span class="likes">${Math.floor(Math.random() * 100)}</span>
              </div>
            </footer>
          </article>
        `;
      }
      html += '</div>';
      return html;
    })()
  };
}

// 基准测试函数
function benchmark(name, fn, iterations = 1000) {
  console.log(`\n=== ${name} ===`);
  
  // 预热
  for (let i = 0; i < 10; i++) {
    fn();
  }
  
  // 测量
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = process.hrtime.bigint();
  const totalTime = Number(end - start) / 1000000; // 转换为毫秒
  const avgTime = totalTime / iterations;
  const opsPerSec = 1000 / avgTime;
  
  console.log(`总时间: ${totalTime.toFixed(2)}ms`);
  console.log(`平均时间: ${avgTime.toFixed(4)}ms`);
  console.log(`每秒操作数: ${opsPerSec.toFixed(0)} ops/sec`);
  
  return {
    totalTime,
    avgTime,
    opsPerSec,
    iterations
  };
}

// 运行基准测试
function runBenchmarks() {
  console.log('cparse 性能基准测试');
  console.log('='.repeat(50));
  
  const testData = generateTestData();
  const results = {};
  
  // HTML 加载基准测试
  results.loadSimple = benchmark('加载简单HTML', () => {
    loadCheerio(testData.simple);
  });
  
  results.loadMedium = benchmark('加载中等HTML', () => {
    loadCheerio(testData.medium);
  });
  
  results.loadComplex = benchmark('加载复杂HTML', () => {
    loadCheerio(testData.complex);
  }, 100);
  
  // 解析基准测试
  const $simple = loadCheerio(testData.simple);
  const $medium = loadCheerio(testData.medium);
  const $complex = loadCheerio(testData.complex);
  
  results.parseSimple = benchmark('简单选择器解析', () => {
    parse('.test', $simple);
  });
  
  results.parseComplex = benchmark('复杂选择器解析', () => {
    parse('.container .content .item', $medium);
  });
  
  results.parseArray = benchmark('数组提取', () => {
    parse('[.item]', $medium);
  });
  
  results.parseObject = benchmark('对象提取', () => {
    parse({
      title: '.post-title',
      author: '.author',
      date: '.date'
    }, $complex);
  }, 100);
  
  results.parseWithFilters = benchmark('带过滤器解析', () => {
    parse('.views | int', $complex);
  });
  
  results.parseComplexObject = benchmark('复杂对象提取', () => {
    parse([
      '[.post]',
      {
        id: '@data-id | int',
        title: '.post-title',
        author: '.author',
        date: '.date',
        excerpt: '.excerpt',
        tags: '[.tag]',
        stats: {
          views: '.views | int',
          likes: '.likes | int'
        }
      }
    ], $complex);
  }, 10);
  
  // 输出汇总
  console.log('\n' + '='.repeat(50));
  console.log('基准测试汇总');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${name.padEnd(20)}: ${result.avgTime.toFixed(4)}ms (${result.opsPerSec.toFixed(0)} ops/sec)`);
  });
  
  // 生成JSON报告
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    results
  };
  
  return report;
}

// 如果直接运行此文件
if (require.main === module) {
  const report = runBenchmarks();
  
  // 可选：保存报告到文件
  const fs = require('fs');
  const path = require('path');
  
  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `benchmark-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`\n报告已保存到: ${reportFile}`);
}

module.exports = { runBenchmarks, benchmark, generateTestData };
