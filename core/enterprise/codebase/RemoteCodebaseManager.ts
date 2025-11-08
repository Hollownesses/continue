import { IDE } from "../../index.js";
import { CodebaseIndexer } from "../../indexing/CodebaseIndexer.js";
import { GitService } from "../integration/GitService.js";

export interface RemoteRepoConfig {
  id: string;
  name: string;
  type: "gitlab" | "github-enterprise" | "bitbucket";
  url: string;
  branch: string;
  auth: {
    type: "token" | "oauth";
    token?: string;
    clientId?: string;
  };
  indexing: {
    enabled: boolean;
    patterns: string[];
    ignore: string[];
  };
}

export interface SyncResult {
  success: boolean;
  filesAdded: number;
  filesModified: number;
  filesDeleted: number;
  error?: string;
}

export class RemoteCodebaseManager {
  private indexer: CodebaseIndexer;
  private gitService: GitService;
  private syncedRepos: Map<string, RemoteRepoConfig> = new Map();

  constructor(private ide: IDE) {
    this.indexer = new CodebaseIndexer(ide, {} as any);
    this.gitService = new GitService();
  }

  async connectRemoteRepository(config: RemoteRepoConfig): Promise<void> {
    try {
      // 验证认证
      const authenticated = await this.gitService.authenticate(config);
      if (!authenticated) {
        throw new Error(`Authentication failed for repository ${config.id}`);
      }

      // 克隆或更新仓库到本地缓存
      const localPath = await this.getLocalCachePath(config.id);
      await this.gitService.cloneOrUpdate(config, localPath);

      this.syncedRepos.set(config.id, config);
    } catch (error) {
      throw new Error(`Failed to connect to repository ${config.id}: ${error}`);
    }
  }

  async syncRepository(repoId: string): Promise<SyncResult> {
    const config = this.syncedRepos.get(repoId);
    if (!config) {
      throw new Error(`Repository ${repoId} not found`);
    }

    const localPath = await this.getLocalCachePath(repoId);
    const syncResult = await this.gitService.sync(config, localPath);

    // 如果同步成功，更新索引
    if (syncResult.success && config.indexing.enabled) {
      await this.createIndexForRemoteRepo(repoId);
    }

    return syncResult;
  }

  async createIndexForRemoteRepo(repoId: string): Promise<void> {
    const config = this.syncedRepos.get(repoId);
    if (!config) return;

    const localPath = await this.getLocalCachePath(repoId);

    // 使用 Continue 的索引系统索引远程仓库
    // 这里需要扩展 CodebaseIndexer 以支持外部路径
    await this.indexer.refresh([localPath], false);
  }

  private async getLocalCachePath(repoId: string): Promise<string> {
    // 返回本地缓存路径
    const workspaceDirs = await this.ide.getWorkspaceDirs();
    return `${workspaceDirs[0]}/.continue/cache/repos/${repoId}`;
  }

  async getRepositoryList(): Promise<RemoteRepoConfig[]> {
    return Array.from(this.syncedRepos.values());
  }
}
