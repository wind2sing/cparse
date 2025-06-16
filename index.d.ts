/**
 * TypeScript 类型定义文件
 * cparse - 一个基于 Cheerio 的 HTML 解析和数据提取工具库
 */

import { CheerioAPI, Cheerio, Element } from 'cheerio';
import { AxiosInstance, AxiosResponse } from 'axios';

declare namespace cparse {
  /**
   * Cheerio 选项接口
   */
  interface CheerioOptions {
    /** 是否保持相对 URL，默认 false */
    keepRelativeUrl?: boolean;
    /** 是否禁用 Cheerio 注入，默认 false */
    disable?: boolean;
    /** Cheerio 原生选项 */
    [key: string]: any;
  }

  /**
   * 过滤器函数类型
   */
  type FilterFunction = (value: any, ...args: any[]) => any;

  /**
   * 过滤器对象类型
   */
  interface Filters {
    [filterName: string]: FilterFunction;
  }

  /**
   * 解析规则类型
   */
  type ParseRule = 
    | string                           // 简单选择器: 'h1', 'a@href'
    | ParseRuleObject                  // 对象规则: { title: 'h1', links: '[a@href]' }
    | ParseRuleArray                   // 数组规则: ['[.item]', { name: '.name' }]
    | ((value: any) => any);           // 函数规则

  /**
   * 对象解析规则
   */
  interface ParseRuleObject {
    [key: string]: ParseRule;
  }

  /**
   * 数组解析规则
   */
  type ParseRuleArray = [string, ParseRule, ...((value: any) => any)[]];

  /**
   * 扩展的 Axios 响应接口
   */
  interface AxiosResponseWithCheerio<T = any> extends AxiosResponse<T> {
    /** Cheerio 实例，当响应为 HTML/XML 时自动注入 */
    $?: CheerioAPI;
  }

  /**
   * 扩展的 Cheerio 接口，包含自定义方法
   */
  interface ExtendedCheerio<T> extends Cheerio<T> {
    /** 提取纯文本内容（不包含子元素标签） */
    string(): string;
    
    /** 获取下一个兄弟节点的文本值 */
    nextNode(): string | undefined;
    
    /** 提取单个元素的指定属性或内容 */
    extract(attr?: string): any;
    
    /** 提取所有匹配元素的指定属性或内容 */
    extractAll(attr?: string): any[];
  }

  /**
   * 扩展的 CheerioAPI 接口
   */
  interface ExtendedCheerioAPI extends CheerioAPI {
    <T extends Element>(selector?: any): ExtendedCheerio<T>;

    /**
     * 简化的解析方法，直接在 Cheerio 实例上调用
     * @param rule 解析规则
     * @param filters 自定义过滤器
     */
    parse<T = any>(rule: ParseRule, filters?: Filters): T;
  }
}

/**
 * 加载 HTML 字符串并返回扩展的 Cheerio 实例
 */
declare function loadCheerio(
  text: string,
  cheerioOptions?: cparse.CheerioOptions,
  responseUrl?: string
): cparse.ExtendedCheerioAPI;

/**
 * 数据解析主函数
 */
declare function parse<T = any>(
  rule: cparse.ParseRule,
  $: cparse.ExtendedCheerioAPI | CheerioAPI,
  filters?: cparse.Filters
): T;

/**
 * 为 Axios 实例添加 Cheerio 支持
 */
declare function cheerioHookForAxios(
  instance: AxiosInstance,
  cheerioOptions?: cparse.CheerioOptions
): AxiosInstance;

/**
 * 为 Got 实例添加 Cheerio 支持
 */
declare function cheerioHookForGot(
  instance: any,
  cheerioOptions?: cparse.CheerioOptions
): any;

// 主要导出
declare const cparse: {
  parse: typeof parse;
  loadCheerio: typeof loadCheerio;
  cheerioHookForAxios: typeof cheerioHookForAxios;
  cheerioHookForGot: typeof cheerioHookForGot;
};

export = cparse;

// 命名导出
export { parse, loadCheerio, cheerioHookForAxios, cheerioHookForGot };

// 类型导出
export namespace cparse {
  export type {
    CheerioOptions,
    FilterFunction,
    Filters,
    ParseRule,
    ParseRuleObject,
    ParseRuleArray,
    AxiosResponseWithCheerio,
    ExtendedCheerio,
    ExtendedCheerioAPI
  };
}

// 扩展 Cheerio 模块声明
declare module 'cheerio' {
  interface Cheerio<T> {
    string(): string;
    nextNode(): string | undefined;
    extract(attr?: string): any;
    extractAll(attr?: string): any[];
  }
}
