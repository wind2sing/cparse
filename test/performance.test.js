/**
 * 性能测试
 */

const { loadCheerio, parse } = require('../index.js');

describe('Performance Tests', () => {
  // 生成大型HTML文档用于性能测试
  function generateLargeHtml(itemCount = 1000) {
    let html = '<html><body><div class="container">';
    
    for (let i = 0; i < itemCount; i++) {
      html += `
        <div class="item" data-id="${i}">
          <h3 class="title">Item ${i}</h3>
          <p class="description">This is item number ${i} with some description text.</p>
          <span class="price">$${(Math.random() * 100).toFixed(2)}</span>
          <div class="meta">
            <span class="category">Category ${i % 10}</span>
            <span class="rating">${(Math.random() * 5).toFixed(1)}</span>
          </div>
        </div>
      `;
    }
    
    html += '</div></body></html>';
    return html;
  }

  // 性能测试辅助函数
  function measureTime(fn, iterations = 1) {
    const start = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // 转换为毫秒
  }

  describe('HTML Loading Performance', () => {
    test('should load large HTML documents efficiently', () => {
      const largeHtml = generateLargeHtml(1000);
      
      const loadTime = measureTime(() => {
        loadCheerio(largeHtml);
      }, 10);
      
      console.log(`Large HTML loading time: ${(loadTime / 10).toFixed(2)}ms per load`);
      
      // 应该在合理时间内完成（每次加载不超过150ms）
      expect(loadTime / 10).toBeLessThan(150);
    });

    test('should handle multiple concurrent loads', async () => {
      const html = generateLargeHtml(500);
      
      const start = process.hrtime.bigint();
      
      const promises = Array.from({ length: 10 }, () => 
        Promise.resolve().then(() => loadCheerio(html))
      );
      
      await Promise.all(promises);
      
      const end = process.hrtime.bigint();
      const totalTime = Number(end - start) / 1000000;
      
      console.log(`Concurrent loading time: ${totalTime.toFixed(2)}ms for 10 loads`);
      
      // 并发加载应该比串行加载更快
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Parsing Performance', () => {
    let $;
    
    beforeAll(() => {
      $ = loadCheerio(generateLargeHtml(1000));
    });

    test('should parse simple selectors quickly', () => {
      const parseTime = measureTime(() => {
        parse('.title', $);
      }, 100);
      
      console.log(`Simple selector parsing time: ${(parseTime / 100).toFixed(2)}ms per parse`);
      
      // 简单选择器解析应该很快（每次不超过15ms）
      expect(parseTime / 100).toBeLessThan(15);
    });

    test('should parse complex selectors efficiently', () => {
      const parseTime = measureTime(() => {
        parse('.container .item .title', $);
      }, 100);
      
      console.log(`Complex selector parsing time: ${(parseTime / 100).toFixed(2)}ms per parse`);
      
      // 复杂选择器解析应该在合理时间内（每次不超过15ms）
      expect(parseTime / 100).toBeLessThan(15);
    });

    test('should handle array extractions efficiently', () => {
      const parseTime = measureTime(() => {
        parse('[.item .title]', $);
      }, 10);
      
      console.log(`Array extraction time: ${(parseTime / 10).toFixed(2)}ms per extraction`);
      
      // 数组提取应该在合理时间内（每次不超过15ms）
      expect(parseTime / 10).toBeLessThan(15);
    });

    test('should handle complex object extractions efficiently', () => {
      const parseTime = measureTime(() => {
        parse({
          title: '.title',
          description: '.description',
          price: '.price | slice:1: | float',
          category: '.category',
          rating: '.rating | float'
        }, $);
      }, 100);
      
      console.log(`Complex object extraction time: ${(parseTime / 100).toFixed(2)}ms per extraction`);
      
      // 复杂对象提取应该在合理时间内（每次不超过80ms）
      expect(parseTime / 100).toBeLessThan(80);
    });

    test('should handle filter chains efficiently', () => {
      const parseTime = measureTime(() => {
        parse('.price | slice:1: | float', $);
      }, 100);
      
      console.log(`Filter chain processing time: ${(parseTime / 100).toFixed(2)}ms per process`);
      
      // 过滤器链处理应该很快（每次不超过15ms）
      expect(parseTime / 100).toBeLessThan(15);
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory with repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 执行大量操作
      for (let i = 0; i < 100; i++) {
        const $ = loadCheerio(generateLargeHtml(100));
        parse('[.item]', $);
        parse({ title: '.title', price: '.price' }, $);
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // 内存增长应该在合理范围内（不超过50MB）
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Scalability', () => {
    test('should scale linearly with document size', () => {
      const sizes = [100, 500, 1000];
      const times = [];
      
      sizes.forEach(size => {
        const html = generateLargeHtml(size);
        const $ = loadCheerio(html);
        
        const time = measureTime(() => {
          parse('[.item .title]', $);
        }, 5);
        
        times.push(time / 5);
        console.log(`Size ${size}: ${(time / 5).toFixed(2)}ms`);
      });
      
      // 检查时间复杂度是否接近线性
      const ratio1 = times[1] / times[0]; // 500/100
      const ratio2 = times[2] / times[1]; // 1000/500
      
      console.log(`Scaling ratios: ${ratio1.toFixed(2)}, ${ratio2.toFixed(2)}`);
      
      // 时间增长应该大致与数据量成正比（允许一些偏差）
      expect(ratio1).toBeGreaterThan(3); // 至少3倍
      expect(ratio1).toBeLessThan(8);    // 不超过8倍
      expect(ratio2).toBeGreaterThan(1.5); // 至少1.5倍
      expect(ratio2).toBeLessThan(3);    // 不超过3倍
    });
  });

  describe('Optimization Verification', () => {
    test('should cache compiled selectors', () => {
      const $ = loadCheerio(generateLargeHtml(100));
      const selector = '.item .title';
      
      // 第一次解析（可能需要编译）
      const firstTime = measureTime(() => {
        parse(selector, $);
      }, 10);
      
      // 后续解析（应该使用缓存）
      const secondTime = measureTime(() => {
        parse(selector, $);
      }, 10);
      
      console.log(`First parse: ${(firstTime / 10).toFixed(2)}ms, Second parse: ${(secondTime / 10).toFixed(2)}ms`);
      
      // 第二次应该更快或至少不慢太多
      expect(secondTime).toBeLessThanOrEqual(firstTime * 1.2);
    });

    test('should reuse Cheerio instances efficiently', () => {
      const html = generateLargeHtml(100);
      const $ = loadCheerio(html);
      
      // 多次使用同一个实例应该很快
      const reuseTime = measureTime(() => {
        parse('.title', $);
        parse('.description', $);
        parse('.price', $);
      }, 50);
      
      console.log(`Instance reuse time: ${(reuseTime / 50).toFixed(2)}ms per triple parse`);
      
      // 重用实例应该很高效（每次三重解析不超过3ms）
      expect(reuseTime / 50).toBeLessThan(3);
    });
  });
});
