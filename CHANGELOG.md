# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.6](https://github.com/wind2sing/cparse/compare/v1.0.5...v1.0.6) (2025-06-16)

#### 重大更新
- **升级 Cheerio 到 1.1.0**: 升级到最新版本的 Cheerio，获得更好的性能和稳定性
- **修复兼容性问题**: 重构插件系统以适应 Cheerio 1.0+ 的 API 变化
- **改进插件实现**: 使用 `this.eq()` 方法替代直接构造函数调用，解决了 "Class constructor LoadedCheerio cannot be invoked without 'new'" 错误

#### 技术改进
- 重构了 `src/cheerio/plugin.js` 中的 `extract` 和 `extractAll` 方法
- 优化了插件启用机制，确保与新版 Cheerio 的兼容性
- 所有现有功能保持向后兼容

#### 测试
- 所有测试用例通过
- 验证了数据提取功能的正确性
- 确保了 URL 转换功能的稳定性

### [1.0.5](https://github.com/wind2sing/cparse/compare/v1.0.4...v1.0.5) (2021-07-14)

### [1.0.4](https://github.com/wind2sing/cparse/compare/v1.0.3...v1.0.4) (2021-07-14)

### [1.0.3](https://github.com/wind2sing/cparse/compare/v1.0.0...v1.0.3) (2020-08-06)

## 1.0.0 (2020-08-06)


### Features

* init files d9dd55e
