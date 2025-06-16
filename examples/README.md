# cparse 使用示例

这个目录包含了 cparse 的各种使用示例，帮助您快速上手和掌握高级用法。

## 示例列表

### 1. 基本用法 (`basic-usage.js`)
演示 cparse 的基本功能：
- HTML 加载和解析
- 基本选择器使用
- 属性提取
- 过滤器应用
- 结构化数据提取

**运行方式:**
```bash
node examples/basic-usage.js
```

### 2. 网页抓取 (`web-scraping.js`)
实际的网页数据抓取示例：
- 电商产品页面数据提取
- 复杂结构化数据处理
- 列表数据批量处理
- 评价和评分提取

**运行方式:**
```bash
node examples/web-scraping.js
```

### 3. HTTP 客户端集成 (`http-integration.js`)
演示与 HTTP 客户端的集成：
- Axios 集成使用
- 自动 Cheerio 注入
- 实时数据抓取
- 响应数据处理

**运行方式:**
```bash
# 需要先安装 axios
npm install axios
node examples/http-integration.js
```

### 4. 高级过滤器 (`advanced-filters.js`)
详细演示各种过滤器的使用：
- 数字类型转换 (int, float)
- 字符串处理 (trim, slice, reverse)
- 日期解析 (date)
- 尺寸解析 (size)
- 布尔值转换 (bool)
- 过滤器链组合

**运行方式:**
```bash
node examples/advanced-filters.js
```

## 快速开始

1. 确保已安装 cparse：
```bash
npm install cparse
```

2. 运行任意示例：
```bash
node examples/basic-usage.js
```

## 示例说明

每个示例都包含详细的注释，解释了：
- 使用场景和目标
- 代码实现步骤
- 输出结果说明
- 最佳实践建议

## 自定义示例

您可以基于这些示例创建自己的数据提取脚本：

1. 复制相关示例文件
2. 修改 HTML 结构和选择器
3. 调整过滤器和数据处理逻辑
4. 运行并验证结果

## 常见问题

### Q: 如何处理动态加载的内容？
A: cparse 主要处理静态 HTML，对于动态内容，建议先使用 Puppeteer 等工具渲染页面。

### Q: 如何处理编码问题？
A: 确保 HTTP 响应的编码正确，cparse 会自动处理 UTF-8 编码的内容。

### Q: 如何提高解析性能？
A: 使用更精确的选择器，避免过度复杂的查询，合理使用缓存。

## 更多资源

- [API 文档](../README.md#api-参考)
- [过滤器文档](../README.md#过滤器)
- [查询语法](../README.md#查询语法)
- [GitHub 仓库](https://github.com/wind2sing/cparse)
