import { Octokit } from '@octokit/rest';

interface DeploymentConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

interface DeploymentResult {
  success: boolean;
  url?: string;
  commitSha?: string;
  error?: string;
  deploymentId?: string;
  netlifyUrl?: string;
}

interface FileContent {
  path: string;
  content: string;
  sha?: string;
}

export class GitHubService {
  private octokit: Octokit;
  private config: DeploymentConfig;

  constructor(config?: Partial<DeploymentConfig>) {
    const defaultConfig = {
      owner: process.env.GITHUB_OWNER || '',
      repo: process.env.GITHUB_REPO || 'landing-pages-deploy',
      branch: 'main',
      token: process.env.GITHUB_TOKEN || ''
    };

    this.config = { ...defaultConfig, ...config };

    if (!this.config.token) {
      throw new Error('GitHub token is required');
    }

    this.octokit = new Octokit({
      auth: this.config.token
    });
  }

  async deployPage(
    userId: string,
    pageId: string,
    html: string,
    metadata: {
      title: string;
      description: string;
      createdAt?: string;
      updatedAt?: string;
    } = { title: 'Landing Page', description: 'Generated landing page' }
  ): Promise<DeploymentResult> {
    try {
      // Validate inputs
      if (!userId || !pageId || !html) {
        throw new Error('userId, pageId, and html are required');
      }

      // Clean IDs for file system safety
      const cleanUserId = this.sanitizeId(userId);
      const cleanPageId = this.sanitizeId(pageId);

      // Create file paths
      const htmlPath = `sites/${cleanUserId}/${cleanPageId}/index.html`;
      const metadataPath = `sites/${cleanUserId}/${cleanPageId}/metadata.json`;

      // Check if repository exists and create if not
      await this.ensureRepositoryExists();

      // Get existing files to determine if this is an update
      const existingFiles = await this.getExistingFiles([htmlPath, metadataPath]);

      // Prepare files to commit
      const filesToCommit: FileContent[] = [
        {
          path: htmlPath,
          content: html,
          sha: existingFiles.get(htmlPath)
        },
        {
          path: metadataPath,
          content: JSON.stringify({
            ...metadata,
            userId: cleanUserId,
            pageId: cleanPageId,
            updatedAt: new Date().toISOString(),
            createdAt: metadata.createdAt || new Date().toISOString()
          }, null, 2),
          sha: existingFiles.get(metadataPath)
        }
      ];

      // Create commit message
      const isUpdate = existingFiles.has(htmlPath);
      const commitMessage = isUpdate 
        ? `Update landing page: ${metadata.title} (${cleanPageId})`
        : `Deploy new landing page: ${metadata.title} (${cleanPageId})`;

      // Create or update files
      const commitResult = await this.createCommit(filesToCommit, commitMessage);

      if (!commitResult.success) {
        throw new Error(commitResult.error || 'Failed to create commit');
      }

      // Wait a bit for GitHub Pages to process
      await this.delay(2000);

      // Generate URLs
      const githubPagesUrl = this.generateGitHubPagesUrl(cleanUserId, cleanPageId);
      const netlifyUrl = await this.getNetlifyUrl(cleanUserId, cleanPageId);

      return {
        success: true,
        commitSha: commitResult.sha,
        url: githubPagesUrl, // Use GitHub Pages as primary URL
        deploymentId: `${cleanUserId}/${cleanPageId}`,
        netlifyUrl: netlifyUrl || undefined
      };

    } catch (error) {
      console.error('Deployment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      };
    }
  }

  async getPagesList(userId: string): Promise<Array<{
    pageId: string;
    title: string;
    description: string;
    url: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const cleanUserId = this.sanitizeId(userId);
      const path = `sites/${cleanUserId}`;

      // Get contents of user directory
      const response = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path
      });

      if (!Array.isArray(response.data)) {
        return [];
      }

      // Get metadata for each page
      const pages = [];
      for (const item of response.data) {
        if (item.type === 'dir') {
          try {
            const metadataResponse = await this.octokit.repos.getContent({
              owner: this.config.owner,
              repo: this.config.repo,
              path: `${path}/${item.name}/metadata.json`
            });

            if ('content' in metadataResponse.data) {
              const metadata = JSON.parse(
                Buffer.from(metadataResponse.data.content, 'base64').toString()
              );
              
              pages.push({
                pageId: item.name,
                title: metadata.title,
                description: metadata.description,
                url: this.generateGitHubPagesUrl(cleanUserId, item.name),
                createdAt: metadata.createdAt,
                updatedAt: metadata.updatedAt
              });
            }
          } catch (error) {
            console.error(`Failed to load metadata for ${item.name}:`, error);
          }
        }
      }

      return pages.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    } catch (error) {
      console.error('Failed to get pages list:', error);
      return [];
    }
  }

  async deletePage(userId: string, pageId: string): Promise<boolean> {
    try {
      const cleanUserId = this.sanitizeId(userId);
      const cleanPageId = this.sanitizeId(pageId);

      const htmlPath = `sites/${cleanUserId}/${cleanPageId}/index.html`;
      const metadataPath = `sites/${cleanUserId}/${cleanPageId}/metadata.json`;

      // Get existing files
      const existingFiles = await this.getExistingFiles([htmlPath, metadataPath]);

      // Delete files
      const deletePromises = [];

      if (existingFiles.has(htmlPath)) {
        deletePromises.push(
          this.octokit.repos.deleteFile({
            owner: this.config.owner,
            repo: this.config.repo,
            path: htmlPath,
            message: `Delete landing page: ${cleanPageId}`,
            sha: existingFiles.get(htmlPath)!
          })
        );
      }

      if (existingFiles.has(metadataPath)) {
        deletePromises.push(
          this.octokit.repos.deleteFile({
            owner: this.config.owner,
            repo: this.config.repo,
            path: metadataPath,
            message: `Delete metadata for: ${cleanPageId}`,
            sha: existingFiles.get(metadataPath)!
          })
        );
      }

      await Promise.all(deletePromises);
      return true;

    } catch (error) {
      console.error('Failed to delete page:', error);
      return false;
    }
  }

  private async ensureRepositoryExists(): Promise<void> {
    try {
      await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });
    } catch (error: any) {
      if (error.status === 404) {
        // Repository doesn't exist, create it
        await this.octokit.repos.createForAuthenticatedUser({
          name: this.config.repo,
          description: 'Landing pages deployed from Landing Page Builder',
          homepage: 'https://landing-page-builder.com',
          private: false,
          has_issues: false,
          has_projects: false,
          has_wiki: false
        });

        // Enable GitHub Pages
        await this.enableGitHubPages();
      } else {
        throw error;
      }
    }
  }

  private async enableGitHubPages(): Promise<void> {
    try {
      await this.octokit.repos.createPagesSite({
        owner: this.config.owner,
        repo: this.config.repo,
        source: {
          branch: this.config.branch,
          path: '/'
        }
      });
    } catch (error) {
      console.error('Failed to enable GitHub Pages:', error);
      // Non-critical error, continue without Pages
    }
  }

  private async getExistingFiles(paths: string[]): Promise<Map<string, string>> {
    const fileMap = new Map<string, string>();

    const promises = paths.map(async (path) => {
      try {
        const response = await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path
        });

        if ('sha' in response.data) {
          fileMap.set(path, response.data.sha);
        }
      } catch (error) {
        // File doesn't exist, which is fine
      }
    });

    await Promise.all(promises);
    return fileMap;
  }

  private async createCommit(
    files: FileContent[],
    message: string
  ): Promise<{ success: boolean; sha?: string; error?: string }> {
    try {
      // Get the current commit SHA and tree SHA
      const branchResponse = await this.octokit.repos.getBranch({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch
      });

      const baseCommitSha = branchResponse.data.commit.sha;
      const baseTreeSha = branchResponse.data.commit.commit.tree.sha;

      // Create blobs for each file
      const blobPromises = files.map(async (file) => {
        const blobResponse = await this.octokit.git.createBlob({
          owner: this.config.owner,
          repo: this.config.repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });

        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blobResponse.data.sha
        };
      });

      const blobs = await Promise.all(blobPromises);

      // Create tree
      const treeResponse = await this.octokit.git.createTree({
        owner: this.config.owner,
        repo: this.config.repo,
        base_tree: baseTreeSha,
        tree: blobs
      });

      // Create commit
      const commitResponse = await this.octokit.git.createCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        message,
        tree: treeResponse.data.sha,
        parents: [baseCommitSha]
      });

      // Update branch reference
      await this.octokit.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
        sha: commitResponse.data.sha
      });

      return {
        success: true,
        sha: commitResponse.data.sha
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateGitHubPagesUrl(userId: string, pageId: string): string {
    return `https://${this.config.owner}.github.io/${this.config.repo}/sites/${userId}/${pageId}`;
  }

  private async getNetlifyUrl(userId: string, pageId: string): Promise<string | null> {
    try {
      // Generate Netlify URL based on the deployment pattern
      // The Netlify site is connected to the GitHub repository
      return `https://landing-pages-deploy.netlify.app/sites/${userId}/${pageId}`;
    } catch (error) {
      return null;
    }
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public method to test GitHub connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.octokit.users.getAuthenticated();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Get rate limit information
  async getRateLimit(): Promise<{
    limit: number;
    remaining: number;
    reset: Date;
  }> {
    const response = await this.octokit.rateLimit.get();
    return {
      limit: response.data.resources.core.limit,
      remaining: response.data.resources.core.remaining,
      reset: new Date(response.data.resources.core.reset * 1000)
    };
  }
}

// Export singleton instance
export const githubService = new GitHubService();