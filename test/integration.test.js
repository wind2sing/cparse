/**
 * 集成测试
 * 测试与各种HTTP客户端的集成功能
 */

const { cheerioHookForAxios, parse, loadCheerio } = require('../index.js');
const http = require('http');

// 模拟服务器
function createMockServer() {
  return http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        
    if (req.url === '/test') {
      res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>测试页面</title>
</head>
<body>
    <div class="container">
        <h1 class="title">测试标题</h1>
        <div class="content">
            <p class="text">这是测试内容</p>
            <ul class="list">
                <li class="item" data-id="1">项目1</li>
                <li class="item" data-id="2">项目2</li>
                <li class="item" data-id="3">项目3</li>
            </ul>
        </div>
        <div class="meta">
            <span class="author">测试作者</span>
            <span class="date">2024-01-15</span>
        </div>
    </div>
</body>
</html>
            `);
    } else if (req.url === '/empty') {
      res.end('<html><body></body></html>');
    } else if (req.url === '/malformed') {
      res.end('<html><body><div><p>未闭合标签</body></html>');
    } else {
      res.writeHead(404);
      res.end('<h1>404 Not Found</h1>');
    }
  });
}

// 启动服务器的辅助函数
function startServer(server, port = 0) {
  return new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(server.address().port);
      }
    });
  });
}

// 停止服务器的辅助函数
function stopServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

describe('HTTP客户端集成测试', () => {
  let server;
  let port;
  let baseUrl;

  beforeAll(async () => {
    server = createMockServer();
    port = await startServer(server);
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    if (server) {
      await stopServer(server);
    }
  });

  describe('Axios集成', () => {
    let axios;
    let client;

    beforeAll(() => {
      try {
        axios = require('axios');
        client = axios.create({
          timeout: 5000
        });
        cheerioHookForAxios(client);
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          console.warn('Axios未安装，跳过Axios集成测试');
        }
      }
    });

    test('应该能够获取HTML并解析', async () => {
      if (!axios) {
        console.warn('跳过Axios测试：未安装axios');
        return;
      }

      const response = await client.get(`${baseUrl}/test`);
            
      expect(response.status).toBe(200);
      expect(response.$).toBeDefined();
            
      const $ = response.$;
      expect($('.title').text()).toBe('测试标题');
      expect($('.text').text()).toBe('这是测试内容');
    });

    test('应该能够使用parse函数解析响应', async () => {
      if (!axios) {
        console.warn('跳过Axios测试：未安装axios');
        return;
      }

      const response = await client.get(`${baseUrl}/test`);
      const $ = response.$;
            
      const result = parse([
        '.container',
        {
          title: '.title',
          content: '.text',
          items: ['.item', { text: '', id: '@data-id' }],
          meta: {
            author: '.author',
            date: '.date'
          }
        }
      ], $);
            
      expect(result).toEqual({
        title: '测试标题',
        content: '这是测试内容',
        items: [
          { text: '项目1', id: '1' },
          { text: '项目2', id: '2' },
          { text: '项目3', id: '3' }
        ],
        meta: {
          author: '测试作者',
          date: '2024-01-15'
        }
      });
    });

    test('应该能够处理空响应', async () => {
      if (!axios) {
        console.warn('跳过Axios测试：未安装axios');
        return;
      }

      const response = await client.get(`${baseUrl}/empty`);
      const $ = response.$;
            
      const result = parse(['.nonexistent', { text: '' }], $);
      expect(result).toEqual([]);
    });

    test('应该能够处理格式错误的HTML', async () => {
      if (!axios) {
        console.warn('跳过Axios测试：未安装axios');
        return;
      }

      const response = await client.get(`${baseUrl}/malformed`);
      const $ = response.$;
            
      // cheerio应该能够处理格式错误的HTML
      expect($('p').text()).toBe('未闭合标签');
    });

    test('应该能够处理网络错误', async () => {
      if (!axios) {
        console.warn('跳过Axios测试：未安装axios');
        return;
      }

      await expect(client.get(`${baseUrl}/nonexistent`))
        .rejects.toThrow();
    });
  });

  describe('原生HTTP模块集成', () => {
    test('应该能够与原生http模块配合使用', async () => {
      const response = await new Promise((resolve, reject) => {
        const req = http.get(`${baseUrl}/test`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ data, status: res.statusCode }));
        });
        req.on('error', reject);
      });

      expect(response.status).toBe(200);

      // 使用loadCheerio解析HTML
      const $ = loadCheerio(response.data);
      const result = parse([
        '.container',
        {
          title: '.title',
          content: '.text'
        }
      ], $);

      expect(result).toEqual({
        title: '测试标题',
        content: '这是测试内容'
      });
    });
  });

  describe('错误处理', () => {
    test('应该能够处理无效的HTML', () => {
      const invalidHtml = '<div><p>未闭合';
      const $ = loadCheerio(invalidHtml);

      const result = parse(['.nonexistent', { text: '' }], $);
      expect(result).toBeUndefined();
    });

    test('应该能够处理空字符串', () => {
      // 空字符串会触发警告，但仍然可以处理
      const $ = loadCheerio(' ');
      const result = parse(['.test', { text: '' }], $);
      expect(result).toBeUndefined();
    });

    test('应该能够处理空HTML', () => {
      const $ = loadCheerio('<html><body></body></html>');
      const result = parse(['.test', { text: '' }], $);
      expect(result).toBeUndefined();
    });

    test('应该能够处理存在的元素但为空的情况', () => {
      const $ = loadCheerio('<div class="test"></div>');
      const result = parse(['.test', { text: 'text' }], $);
      expect(result).toEqual({ text: undefined });
    });
  });
});
