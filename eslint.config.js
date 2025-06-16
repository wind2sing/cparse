const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      // 代码风格
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      
      // 最佳实践
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-console': 'off', // 允许 console，因为这是一个库
      'no-debugger': 'error',
      
      // 错误预防
      'no-undef': 'error',
      'no-unused-expressions': 'error',
      'no-unreachable': 'error',
      
      // 代码复杂度
      'complexity': ['warn', 15],
      'max-depth': ['warn', 4],
      
      // 空格和格式
      'space-before-blocks': 'error',
      'space-in-parens': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': 'error',
      'key-spacing': 'error'
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      'no-unused-expressions': 'off', // Jest 的 expect 语法
      'max-lines-per-function': 'off' // 测试文件可以有更长的函数
    }
  },
  {
    ignores: [
      'node_modules/',
      'coverage/',
      'dist/',
      'build/',
      '*.min.js',
      'examples/node_modules/',
      '.nyc_output/'
    ]
  }
];
