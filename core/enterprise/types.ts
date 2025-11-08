/**
 * 企业级扩展 - 统一类型定义
 *
 * 本文件包含企业级扩展所需的所有接口和类型定义
 * 包括：API 客户端、代码库、规则库、模板库等相关类型
 */

import { Chunk } from "../index.js";

// ============================================================================
// API 客户端相关类型
// ============================================================================

/**
 * API 请求选项
 */
export interface ApiOptions {
  /** HTTP 方法 */
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体 */
  body?: any;
  /** 重试次数（默认 3 次） */
  retries?: number;
  /** 是否启用缓存（仅 GET 请求） */
  cache?: boolean;
  /** 缓存过期时间（毫秒，默认 5 分钟） */
  cacheExpiry?: number;
  /** 请求超时时间（毫秒） */
  timeout?: number;
}

/**
 * API 响应
 */
export interface ApiResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** HTTP 状态码 */
  status: number;
  /** 响应头 */
  headers: Record<string, string>;
  /** 响应时间（毫秒） */
  responseTime?: number;
}

/**
 * API 请求错误
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 网络错误
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * 批量请求项
 */
export interface BatchRequestItem {
  endpoint: string;
  options?: ApiOptions;
}

/**
 * 批量响应项
 */
export interface BatchResponseItem<T = any> {
  endpoint: string;
  response: ApiResponse<T>;
  error?: Error;
}

// ============================================================================
// 企业代码库相关类型
// ============================================================================

/**
 * 远程仓库类型
 */
export type RemoteRepositoryType =
  | "gitlab"
  | "github-enterprise"
  | "bitbucket"
  | "git";

/**
 * 远程仓库配置
 */
export interface RemoteRepoConfig {
  /** 仓库唯一标识符 */
  id: string;
  /** 仓库显示名称 */
  name: string;
  /** 仓库类型 */
  type: RemoteRepositoryType;
  /** 仓库 URL */
  url: string;
  /** 默认分支 */
  branch: string;
  /** 认证配置（暂时简化，后续可扩展） */
  auth?: {
    type: "token" | "oauth";
    token?: string;
    clientId?: string;
    clientSecret?: string;
  };
  /** 索引配置 */
  indexing: {
    /** 是否启用索引 */
    enabled: boolean;
    /** 包含的文件模式 */
    patterns: string[];
    /** 忽略的文件模式 */
    ignore: string[];
    /** 索引优先级（high/medium/low） */
    priority?: "high" | "medium" | "low";
  };
  /** 工作目录（可选，用于 Git 操作） */
  cwd?: string;
  /** 环境变量（可选） */
  env?: Record<string, string>;
}

/**
 * 同步结果
 */
export interface SyncResult {
  /** 是否成功 */
  success: boolean;
  /** 新增文件数 */
  filesAdded: number;
  /** 修改文件数 */
  filesModified: number;
  /** 删除文件数 */
  filesDeleted: number;
  /** 同步开始时间 */
  startTime?: string;
  /** 同步结束时间 */
  endTime?: string;
  /** 错误信息 */
  error?: string;
  /** 警告信息 */
  warnings?: string[];
}

/**
 * 仓库同步状态
 */
export type RepoSyncStatus =
  | "idle"
  | "syncing"
  | "indexing"
  | "completed"
  | "error"
  | "paused";

/**
 * 仓库状态信息
 */
export interface RepoStatus {
  /** 仓库 ID */
  repoId: string;
  /** 仓库名称 */
  name: string;
  /** 同步状态 */
  syncStatus: RepoSyncStatus;
  /** 最后同步时间 */
  lastSyncTime?: string;
  /** 索引状态 */
  indexStatus: IndexStatus;
  /** 错误信息 */
  errors?: string[];
}

/**
 * 索引状态
 */
export interface IndexStatus {
  /** 是否已索引 */
  indexed: boolean;
  /** 索引进度（0-1） */
  progress: number;
  /** 索引开始时间 */
  startTime?: string;
  /** 索引完成时间 */
  endTime?: string;
  /** 索引文件数 */
  filesIndexed?: number;
  /** 总文件数 */
  totalFiles?: number;
}

/**
 * 多仓库索引结果
 */
export interface MultiRepoIndexResult {
  /** 仓库 ID */
  repoId: string;
  /** 索引的代码块 */
  chunks: Chunk[];
  /** 索引状态 */
  status: "success" | "partial" | "failed";
  /** 错误信息 */
  error?: string;
}

/**
 * 跨仓库搜索选项
 */
export interface CrossRepoSearchOptions {
  /** 要搜索的仓库 ID 列表（为空则搜索所有仓库） */
  repoIds?: string[];
  /** 最大返回结果数 */
  maxResults?: number;
  /** 搜索模式：语义搜索 / 全文搜索 */
  searchMode?: "semantic" | "fulltext" | "both";
  /** 文件类型过滤 */
  fileTypes?: string[];
  /** 目录过滤 */
  directories?: string[];
}

/**
 * 权限操作类型
 */
export type PermissionAction = "read" | "write" | "index" | "sync";

/**
 * 权限检查结果
 */
export interface PermissionResult {
  /** 是否有权限 */
  allowed: boolean;
  /** 权限原因 */
  reason?: string;
}

/**
 * 用户权限信息
 */
export interface UserPermissions {
  /** 用户 ID */
  userId: string;
  /** 角色列表 */
  roles: string[];
  /** 权限列表 */
  permissions: string[];
  /** 仓库访问权限 */
  repoAccess: RepoAccess[];
}

/**
 * 仓库访问权限
 */
export interface RepoAccess {
  /** 仓库 ID */
  repoId: string;
  /** 权限级别 */
  level: "read" | "write" | "admin";
  /** 可访问的路径（空数组表示全部） */
  paths?: string[];
}

// ============================================================================
// 企业规则库相关类型
// ============================================================================

/**
 * 规则源类型
 */
export type RuleSourceType = "http" | "git" | "mcp" | "file";

/**
 * 冲突解决策略
 */
export type ConflictResolutionStrategy =
  | "remote-wins"
  | "local-wins"
  | "merge"
  | "prompt";

/**
 * 规则源配置
 */
export interface RuleSource {
  /** 规则源名称 */
  name: string;
  /** 规则源类型 */
  type: RuleSourceType;
  /** 规则源 URL 或路径 */
  url: string;
  /** 认证配置（可选） */
  auth?: {
    type: "token" | "oauth" | "basic";
    token?: string;
    username?: string;
    password?: string;
  };
  /** 同步配置 */
  sync: {
    /** 是否启用同步 */
    enabled: boolean;
    /** 同步间隔（秒） */
    interval: number;
    /** 冲突解决策略 */
    conflictResolution: ConflictResolutionStrategy;
  };
  /** 规则分类过滤（可选） */
  categories?: string[];
  /** Git 配置（当 type 为 git 时） */
  git?: {
    branch?: string;
    path?: string;
  };
}

/**
 * 规则版本信息
 */
export interface RuleVersion {
  /** 版本号 */
  version: string;
  /** 规则内容 */
  content: string;
  /** 创建时间 */
  createdAt: string;
  /** 作者 */
  author: string;
  /** 变更日志 */
  changelog?: string;
  /** 是否为当前版本 */
  isCurrent?: boolean;
}

/**
 * 规则变更事件
 */
export interface RuleChangeEvent {
  /** 规则 ID */
  ruleId: string;
  /** 变更类型 */
  type: "created" | "updated" | "deleted";
  /** 变更时间 */
  timestamp: string;
  /** 变更作者 */
  author: string;
  /** 变更说明 */
  description?: string;
  /** 变更前版本 */
  previousVersion?: string;
  /** 变更后版本 */
  newVersion?: string;
}

/**
 * 规则分类
 */
export interface RuleCategory {
  /** 分类 ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 分类描述 */
  description?: string;
  /** 优先级 */
  priority: "high" | "medium" | "low";
  /** 父分类 ID（支持分类层级） */
  parentId?: string;
}

/**
 * 规则模板上下文
 */
export interface RuleContext {
  /** 项目名称 */
  projectName?: string;
  /** 项目类型 */
  projectType?: string;
  /** 当前文件路径 */
  currentFile?: string;
  /** 语言类型 */
  language?: string;
  /** 自定义变量 */
  variables?: Record<string, any>;
}

/**
 * 规则模板
 */
export interface RuleTemplate {
  /** 模板 ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板内容 */
  content: string;
  /** 模板变量 */
  variables: RuleTemplateVariable[];
  /** 适用条件 */
  conditions?: {
    /** 适用的文件模式 */
    globs?: string[];
    /** 适用的语言 */
    languages?: string[];
  };
}

/**
 * 规则模板变量
 */
export interface RuleTemplateVariable {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: "string" | "number" | "boolean" | "select";
  /** 变量描述 */
  description: string;
  /** 是否必需 */
  required: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 选项（select 类型） */
  options?: string[];
}

/**
 * 规则同步结果
 */
export interface RuleSyncResult {
  /** 规则源名称 */
  sourceName: string;
  /** 成功同步的规则数 */
  syncedCount: number;
  /** 失败的规则数 */
  failedCount: number;
  /** 冲突的规则数 */
  conflictedCount: number;
  /** 错误信息 */
  errors?: string[];
  /** 警告信息 */
  warnings?: string[];
}

// ============================================================================
// 企业模板库相关类型
// ============================================================================

/**
 * 模板类型
 */
export type TemplateType = "code" | "prompt" | "config" | "snippet";

/**
 * 模板变量类型
 */
export type TemplateVariableType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "multiline";

/**
 * 模板变量定义
 */
export interface TemplateVariable {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: TemplateVariableType;
  /** 变量描述 */
  description: string;
  /** 是否必需 */
  required: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 选项（select 类型） */
  options?: string[];
  /** 验证规则（正则表达式或函数） */
  validation?: string | ((value: any) => boolean);
}

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  /** 作者 */
  author: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 使用次数 */
  usageCount: number;
  /** 评分（0-5） */
  rating?: number;
  /** 标签 */
  tags?: string[];
  /** 版本号 */
  version?: string;
}

/**
 * 模板定义
 */
export interface Template {
  /** 模板 ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板分类 */
  category: string;
  /** 模板类型 */
  type: TemplateType;
  /** 模板内容 */
  content: string;
  /** 模板变量 */
  variables: TemplateVariable[];
  /** 元数据 */
  metadata: TemplateMetadata;
  /** 标签（用于搜索） */
  tags: string[];
  /** 语言（适用于代码模板） */
  language?: string;
  /** 文件扩展名（适用于代码模板） */
  fileExtension?: string;
}

/**
 * 代码模板
 */
export interface CodeTemplate extends Template {
  type: "code";
  /** 模板语言 */
  language: string;
  /** 文件扩展名 */
  fileExtension: string;
  /** 文件路径模板（支持变量） */
  filePathTemplate?: string;
}

/**
 * 提示词模板
 */
export interface PromptTemplate extends Template {
  type: "prompt";
  /** 是否可转换为 slash command */
  canConvertToSlashCommand?: boolean;
  /** slash command 配置 */
  slashCommandConfig?: {
    name: string;
    description: string;
  };
}

/**
 * 模板上下文
 */
export interface TemplateContext {
  /** 当前文件路径 */
  currentFile?: string;
  /** 项目名称 */
  projectName?: string;
  /** 项目类型 */
  projectType?: string;
  /** 语言类型 */
  language?: string;
  /** 当前目录 */
  currentDirectory?: string;
  /** 用户输入（用于变量替换） */
  userInput?: string;
  /** 自定义变量 */
  variables?: Record<string, any>;
}

/**
 * 模板使用记录
 */
export interface TemplateUsage {
  /** 模板 ID */
  templateId: string;
  /** 使用时间 */
  timestamp: string;
  /** 用户 ID */
  user: string;
  /** 使用的变量值 */
  variables?: Record<string, any>;
  /** 生成的文件路径（适用于代码模板） */
  filePath?: string;
}

/**
 * 模板推荐选项
 */
export interface TemplateRecommendationOptions {
  /** 语言类型 */
  language?: string;
  /** 项目类型 */
  projectType?: string;
  /** 当前文件路径 */
  currentFile?: string;
  /** 用户输入 */
  userInput?: string;
  /** 最大推荐数量 */
  maxResults?: number;
  /** 分类过滤 */
  category?: string;
}

/**
 * 模板搜索选项
 */
export interface TemplateSearchOptions {
  /** 搜索关键词 */
  query: string;
  /** 分类过滤 */
  category?: string;
  /** 类型过滤 */
  type?: TemplateType;
  /** 标签过滤 */
  tags?: string[];
  /** 语言过滤 */
  language?: string;
  /** 最大结果数 */
  maxResults?: number;
}

/**
 * 模板渲染结果
 */
export interface TemplateRenderResult {
  /** 渲染后的内容 */
  content: string;
  /** 使用的变量值 */
  variables: Record<string, any>;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

// ============================================================================
// 配置相关类型
// ============================================================================

/**
 * 企业配置扩展
 */
export interface EnterpriseConfig {
  /** 代码库配置 */
  codebase?: {
    repositories: RemoteRepoConfig[];
  };
  /** 规则库配置 */
  rules?: {
    sources: RuleSource[];
    categories?: RuleCategory[];
  };
  /** 模板库配置 */
  templates?: {
    sources: TemplateSource[];
    categories?: TemplateCategory[];
    autoRecommend?: boolean;
  };
  /** API 基础配置 */
  api?: {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
  };
}

/**
 * 模板源配置
 */
export interface TemplateSource {
  /** 源名称 */
  name: string;
  /** 源类型 */
  type: "http" | "git" | "file";
  /** 源 URL 或路径 */
  url: string;
  /** 认证配置 */
  auth?: {
    type: "token" | "oauth";
    token?: string;
  };
  /** 同步配置 */
  sync?: {
    enabled: boolean;
    interval: number;
  };
}

/**
 * 模板分类配置
 */
export interface TemplateCategory {
  /** 分类 ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 分类描述 */
  description?: string;
  /** 图标（可选） */
  icon?: string;
}

// ============================================================================
// 通用工具类型
// ============================================================================

/**
 * 异步操作结果
 */
export interface AsyncResult<T> {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
}

/**
 * 分页选项
 */
export interface PaginationOptions {
  /** 页码（从 1 开始） */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  items: T[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 排序选项
 */
export interface SortOptions {
  /** 排序字段 */
  field: string;
  /** 排序方向 */
  order: "asc" | "desc";
}

/**
 * 过滤选项
 */
export interface FilterOptions {
  /** 字段名 */
  field: string;
  /** 操作符 */
  operator:
    | "equals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "in"
    | "gt"
    | "lt";
  /** 值 */
  value: any;
}

/**
 * 查询选项
 */
export interface QueryOptions {
  /** 分页选项 */
  pagination?: PaginationOptions;
  /** 排序选项 */
  sort?: SortOptions[];
  /** 过滤选项 */
  filters?: FilterOptions[];
  /** 搜索关键词 */
  search?: string;
}

// ============================================================================
// 导出所有类型
// ============================================================================

export type {
  ApiError,
  // API 相关
  ApiOptions,
  ApiResponse,
  // 通用工具类型
  AsyncResult,
  BatchRequestItem,
  BatchResponseItem,
  CodeTemplate,
  ConflictResolutionStrategy,
  CrossRepoSearchOptions,
  // 配置相关
  EnterpriseConfig,
  FilterOptions,
  IndexStatus,
  MultiRepoIndexResult,
  NetworkError,
  PaginatedResult,
  PaginationOptions,
  PermissionAction,
  PermissionResult,
  PromptTemplate,
  QueryOptions,
  RemoteRepoConfig,
  // 代码库相关
  RemoteRepositoryType,
  RepoAccess,
  RepoStatus,
  RepoSyncStatus,
  RuleCategory,
  RuleChangeEvent,
  RuleContext,
  RuleSource,
  // 规则库相关
  RuleSourceType,
  RuleSyncResult,
  RuleTemplate,
  RuleTemplateVariable,
  RuleVersion,
  SortOptions,
  SyncResult,
  Template,
  TemplateCategory,
  TemplateContext,
  TemplateMetadata,
  TemplateRecommendationOptions,
  TemplateRenderResult,
  TemplateSearchOptions,
  TemplateSource,
  // 模板库相关
  TemplateType,
  TemplateUsage,
  TemplateVariable,
  TemplateVariableType,
  UserPermissions,
};
