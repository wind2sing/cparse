# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/wind2sing/cparse/compare/v1.0.6...v2.0.0) (2024-12-16)

### 💥 重大更新 (Breaking Changes)
这是一个重大版本更新，包含了大量新功能和改进。虽然大部分API保持向后兼容，但建议仔细测试现有代码。

### 🎉 重大功能更新

#### 新增过滤器 (30+个)
- **字符串处理**: `regex`, `replace`, `split`, `join`, `capitalize`, `upper`, `lower`, `title`
- **数组处理**: `length`, `first`, `last`, `unique`, `sort`, `compact`
- **数字处理**: `number` (格式化数字，支持小数位控制)
- **类型转换**: 增强的 `int`, `float`, `bool` 过滤器

#### 高级查询语法
- **条件查询**:
  - 类条件: `selector[.class]`
  - 属性条件: `selector[attr]`, `selector[attr=value]`
  - 伪选择器: `selector:first`, `selector:last`, `selector:empty`, `selector:contains("text")`
- **嵌套查询**: `parent > child > target` 支持多级嵌套

#### 错误处理系统
- **自定义错误类型**: `ParseError`, `QueryParseError`, `FilterError`, `ValidationError`
- **输入验证器**: `Validator` 类，提供全面的输入验证
- **错误处理工具**: `ErrorHandler` 类，支持安全执行和错误格式化

#### 性能优化
- **查询缓存**: 自动缓存解析后的查询，提高重复查询性能
- **批量处理**: 优化的批量数据提取支持
- **内存管理**: 限制缓存大小，防止内存泄漏

#### 测试增强
- **集成测试**: HTTP客户端集成测试，支持Axios和原生HTTP
- **性能测试**: 大规模数据处理性能测试
- **错误处理测试**: 全面的错误场景测试
- **测试覆盖率**: 207个测试用例，覆盖所有主要功能

#### 文档完善
- **API文档**: 详细的API参考 (`docs/API.md`)
- **过滤器文档**: 完整的过滤器参考 (`docs/FILTERS.md`)
- **示例代码**: 高级功能使用示例 (`examples/advanced-features.js`)
- **README更新**: 包含所有新功能的使用说明

#### 开发体验
- **VSCode配置**: 编辑器设置和扩展推荐
- **代码规范**: EditorConfig, ESLint, Prettier配置
- **开发工具**: 改进的开发和调试体验

### 🔧 技术改进
- **查询解析器重构**: 支持复杂查询语法的全新解析器
- **模块化设计**: 更好的代码组织和模块分离
- **错误传播**: 改进的错误处理和传播机制
- **类型安全**: 更好的输入验证和类型检查

### 🐛 修复
- 修复复杂CSS选择器的解析问题
- 修复过滤器链中的错误传播
- 修复边缘情况下的内存泄漏
- 修复伪选择器与空格的冲突问题

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
