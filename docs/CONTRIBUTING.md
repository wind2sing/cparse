# 贡献指南

感谢您对 cparse 项目的关注！我们欢迎各种形式的贡献。

## 开发环境设置

### 前置要求

- Node.js >= 18.17.0
- npm >= 8.0.0

### 安装依赖

```bash
git clone https://github.com/wind2sing/cparse.git
cd cparse
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### 代码质量检查

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix
```

## 项目结构

```
cparse/
├── src/                    # 源代码
│   ├── cheerio/           # Cheerio 扩展模块
│   │   ├── index.js       # 主入口
│   │   ├── plugin.js      # Cheerio 插件
│   │   └── absolute-url.js # URL 转换
│   ├── parse.js           # 解析核心
│   ├── query-parser.js    # 查询解析器
│   ├── format-parser.js   # 格式解析器
│   └── filters.js         # 内置过滤器
├── test/                  # 测试文件
├── examples/              # 使用示例
├── benchmark/             # 性能基准测试
├── docs/                  # 文档
└── index.js              # 主入口文件
```

## 贡献类型

### 1. Bug 报告

如果您发现了 bug，请创建一个 issue 并包含：

- 清晰的问题描述
- 重现步骤
- 期望的行为
- 实际的行为
- 环境信息（Node.js 版本、操作系统等）
- 最小化的重现代码

### 2. 功能请求

对于新功能建议：

- 描述功能的用途和价值
- 提供使用场景示例
- 考虑向后兼容性
- 讨论可能的实现方案

### 3. 代码贡献

#### 开发流程

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 进行开发
4. 添加测试
5. 确保所有测试通过
6. 提交代码：`git commit -m "feat: add your feature"`
7. 推送分支：`git push origin feature/your-feature-name`
8. 创建 Pull Request

#### 代码规范

- 使用 ESLint 配置的代码风格
- 为新功能添加测试
- 保持测试覆盖率
- 添加适当的 JSDoc 注释
- 遵循现有的命名约定

#### 提交信息规范

使用 [Conventional Commits](https://conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型包括：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(parser): add support for custom filters
fix(cheerio): resolve memory leak in plugin system
docs: update API documentation
```

### 4. 文档贡献

- 修正错别字和语法错误
- 改进现有文档的清晰度
- 添加使用示例
- 翻译文档

## 测试指南

### 单元测试

- 为所有新功能编写测试
- 测试应该覆盖正常情况和边界情况
- 使用描述性的测试名称
- 保持测试的独立性

### 性能测试

- 对性能敏感的功能添加基准测试
- 确保新功能不会显著降低性能
- 运行 `node benchmark/basic.js` 进行性能测试

### 测试覆盖率

- 保持高测试覆盖率（目标 > 90%）
- 关注分支覆盖率，不仅仅是行覆盖率

## 发布流程

1. 更新版本号（遵循 [Semantic Versioning](https://semver.org/)）
2. 更新 CHANGELOG.md
3. 运行所有测试和检查
4. 创建 Git 标签
5. 推送到 GitHub
6. CI/CD 自动发布到 npm

## 获取帮助

- 查看现有的 [Issues](https://github.com/wind2sing/cparse/issues)
- 阅读 [API 文档](../README.md)
- 查看 [示例代码](../examples/)

## 行为准则

请遵循我们的行为准则：

- 尊重所有贡献者
- 使用友好和包容的语言
- 接受建设性的批评
- 专注于对社区最有利的事情

感谢您的贡献！
