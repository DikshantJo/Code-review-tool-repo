#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { glob } = require('glob');

class CodeReviewBot {
  constructor() {
    // Validate required environment variables
    this.validateEnvironment();
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.config = this.loadConfig();
    this.repository = process.env.GITHUB_REPOSITORY;
    this.sha = process.env.GITHUB_SHA;
    this.branchName = process.env.BRANCH_NAME;
    this.sourceBranch = process.env.SOURCE_BRANCH;
  }

  validateEnvironment() {
    const required = ['GITHUB_TOKEN', 'OPENAI_API_KEY', 'GITHUB_REPOSITORY', 'GITHUB_SHA', 'BRANCH_NAME'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing.join(', '));
      process.exit(1);
    }
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'config', 'review-criteria.yml');
      const configContent = fs.readFileSync(configPath, 'utf8');
      return yaml.parse(configContent);
    } catch (error) {
      console.error('Error loading configuration:', error);
      process.exit(1);
    }
  }

  async getChangedFiles() {
    try {
      let baseSha;
      
      console.log(`🔍 Detecting file changes for commit: ${this.sha}`);
      console.log(`📋 Event type: ${process.env.GITHUB_EVENT_NAME}`);
      
      if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
        // For PRs, compare with base branch
        console.log(`🔗 Pull request #${process.env.GITHUB_EVENT_NUMBER}`);
        const { data: pr } = await this.octokit.rest.pulls.get({
          owner: this.repository.split('/')[0],
          repo: this.repository.split('/')[1],
          pull_number: process.env.GITHUB_EVENT_NUMBER
        });
        baseSha = pr.base.sha;
        console.log(`📊 PR base: ${baseSha}, head: ${pr.head.sha}`);
      } else {
        // For pushes, compare with previous commit
        console.log(`📤 Push event - getting previous commit`);
        const { data: commits } = await this.octokit.rest.repos.listCommits({
          owner: this.repository.split('/')[0],
          repo: this.repository.split('/')[1],
          sha: this.sha,
          per_page: 2
        });
        baseSha = commits[1]?.sha;
        console.log(`📊 Current: ${this.sha}, Previous: ${baseSha}`);
      }

      if (!baseSha) {
        console.log('⚠️  No base commit found, analyzing all files');
        return await this.getAllFiles();
      }

      console.log(`🔄 Comparing commits: ${baseSha} → ${this.sha}`);
      const { data: comparison } = await this.octokit.rest.repos.compareCommits({
        owner: this.repository.split('/')[0],
        repo: this.repository.split('/')[1],
        base: baseSha,
        head: this.sha
      });

      const files = comparison.files || [];
      console.log(`📁 Found ${files.length} changed files:`);
      files.forEach(file => {
        console.log(`   ${file.status}: ${file.filename}`);
      });

      return files;
    } catch (error) {
      console.error('❌ Error getting changed files:', error);
      // Fallback to analyzing all files if diff fails
      console.log('🔄 Falling back to analyzing all files');
      return await this.getAllFiles();
    }
  }

  async getAllFiles() {
    try {
      const includePatterns = this.config.global.include_extensions.map(ext => `**/*${ext}`);
      const excludePatterns = this.config.global.exclude_patterns;
      
      const files = await glob(includePatterns, {
        ignore: excludePatterns,
        cwd: process.cwd()
      });

      return files.map(file => ({
        filename: file,
        status: 'added',
        patch: null // Will be fetched via GitHub API
      }));
    } catch (error) {
      console.error('Error getting all files:', error);
      return [];
    }
  }

  async getRecentFiles() {
    try {
      console.log('🔍 Getting recent files from repository...');
      
      // Get recent commits to find recently modified files
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner: this.repository.split('/')[0],
        repo: this.repository.split('/')[1],
        sha: this.branchName,
        per_page: 5 // Get last 5 commits
      });

      const recentFiles = new Set();
      
      // Get files from recent commits
      for (const commit of commits.slice(0, 3)) { // Check last 3 commits
        try {
          const { data: commitData } = await this.octokit.rest.repos.getCommit({
            owner: this.repository.split('/')[0],
            repo: this.repository.split('/')[1],
            ref: commit.sha
          });
          
          if (commitData.files) {
            commitData.files.forEach(file => {
              if (file.filename && this.shouldIncludeFile(file.filename)) {
                recentFiles.add(file.filename);
              }
            });
          }
        } catch (error) {
          console.log(`⚠️  Could not get files for commit ${commit.sha}: ${error.message}`);
        }
      }

      const files = Array.from(recentFiles).slice(0, 10); // Limit to 10 files
      console.log(`📁 Found ${files.length} recent files to analyze`);
      
      return files.map(filename => ({
        filename: filename,
        status: 'modified',
        patch: null
      }));
    } catch (error) {
      console.error('Error getting recent files:', error);
      return [];
    }
  }

  shouldIncludeFile(filename) {
    const excludePatterns = this.config.global.exclude_patterns;
    const includeExtensions = this.config.global.include_extensions;
    
    // Check exclude patterns
    for (const pattern of excludePatterns) {
      if (this.matchesPattern(filename, pattern)) {
        return false;
      }
    }
    
    // Check include extensions
    return includeExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext.toLowerCase())
    );
  }

  filterFiles(files) {
    const excludePatterns = this.config.global.exclude_patterns;
    const includeExtensions = this.config.global.include_extensions;
    
    return files.filter(file => {
      // Check exclude patterns
      for (const pattern of excludePatterns) {
        if (this.matchesPattern(file.filename, pattern)) {
          return false;
        }
      }
      
      // Check include extensions
      const hasValidExtension = includeExtensions.some(ext => 
        file.filename.toLowerCase().endsWith(ext.toLowerCase())
      );
      
      return hasValidExtension;
    });
  }

  matchesPattern(filename, pattern) {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filename);
  }

  async getFileContent(filename) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.repository.split('/')[0],
        repo: this.repository.split('/')[1],
        path: filename,
        ref: this.sha
      });
      
      if (data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        
        // Limit file size to prevent OpenAI API issues (50KB limit)
        const maxSize = 50 * 1024; // 50KB
        if (content.length > maxSize) {
          console.log(`File ${filename} is too large (${content.length} bytes), truncating to ${maxSize} bytes`);
          return content.substring(0, maxSize) + '\n... (truncated due to size)';
        }
        
        return content;
      }
      return null;
    } catch (error) {
      console.error(`Error getting content for ${filename}:`, error);
      return null;
    }
  }

  async reviewCode(files) {
    const branchConfig = this.config.branches[this.branchName.toLowerCase()];
    if (!branchConfig) {
      console.log(`No configuration found for branch: ${this.branchName}`);
      console.log(`Available branches: ${Object.keys(this.config.branches).join(', ')}`);
      return [];
    }

    const issues = [];
    
    for (const file of files) {
      try {
        let content = '';
        
        // For GitHub API files, use patch if available, otherwise get full content
        if (file.patch) {
          content = file.patch;
        } else if (file.filename) {
          content = await this.getFileContent(file.filename);
        }
        
        if (!content) {
          console.log(`Skipping ${file.filename}: no content available`);
          continue;
        }

        // Limit content size for OpenAI API (reduce from 4000 to 3000 chars to be safe)
        const maxContentLength = 3000;
        if (content.length > maxContentLength) {
          content = content.substring(0, maxContentLength) + '\n... (truncated)';
        }

        const reviewResult = await this.analyzeWithOpenAI(content, file.filename, branchConfig);
        
        if (reviewResult.issues && reviewResult.issues.length > 0) {
          issues.push({
            file: file.filename,
            issues: reviewResult.issues,
            severity: reviewResult.severity
          });
        }
      } catch (error) {
        console.error(`Error reviewing ${file.filename}:`, error);
      }
    }
    
    return issues;
  }

  async analyzeWithOpenAI(content, filename, branchConfig) {
    try {
      console.log(`🤖 Analyzing ${filename} with OpenAI...`);
      console.log(`📏 Content length: ${content.length} characters`);
      
      const criteria = branchConfig.review_criteria;
      const criteriaText = Object.entries(criteria)
        .map(([category, items]) => `${category.toUpperCase()}:\n${items.map(item => `- ${item}`).join('\n')}`)
        .join('\n\n');

      const prompt = `${this.config.openai.system_prompt}

REVIEW CRITERIA:
${criteriaText}

FILE: ${filename}
CODE TO REVIEW:
\`\`\`
${content}
\`\`\`

Please analyze this code and provide:
1. A list of issues found (if any)
2. Severity level for each issue (high/medium/low)
3. Specific recommendations for fixes

Format your response as JSON:
{
  "issues": [
    {
      "description": "Issue description",
      "severity": "high|medium|low",
      "line": "line number or range",
      "recommendation": "How to fix this issue"
    }
  ],
  "severity": "overall severity (highest found)"
}`;

      console.log(`📤 Sending request to OpenAI (${this.config.openai.model})...`);
      const response = await this.openai.chat.completions.create({
        model: this.config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.openai.max_tokens,
        temperature: this.config.openai.temperature
      });
      
      console.log(`📥 Received response from OpenAI`);

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        console.error('Empty response from OpenAI');
        return { issues: [], severity: 'low' };
      }
      
      try {
        const result = JSON.parse(responseContent);
        console.log(`✅ Analysis complete for ${filename}:`);
        console.log(`   📊 Found ${result.issues ? result.issues.length : 0} issues`);
        console.log(`   🚨 Overall severity: ${result.severity || 'low'}`);
        if (result.issues && result.issues.length > 0) {
          result.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
          });
        }
        return result;
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
        console.error('Raw response:', responseContent);
        return { issues: [], severity: 'low' };
      }
    } catch (error) {
      console.error('Error analyzing with OpenAI:', error);
      if (error.status === 401) {
        console.error('OpenAI API key is invalid or expired');
      } else if (error.status === 429) {
        console.error('OpenAI API rate limit exceeded');
      } else if (error.status === 500) {
        console.error('OpenAI API server error');
      }
      return { issues: [], severity: 'low' };
    }
  }

  async createGitHubIssue(fileIssues, severity) {
    const branchConfig = this.config.branches[this.branchName.toLowerCase()];
    if (!branchConfig) {
      console.log('No branch configuration found, skipping issue creation');
      return;
    }
    
    const severityThreshold = branchConfig.severity_threshold;
    
    // Check if severity meets threshold
    const severityLevels = { low: 1, medium: 2, high: 3 };
    if (severityLevels[severity] < severityLevels[severityThreshold]) {
      console.log(`Severity ${severity} below threshold ${severityThreshold}, skipping issue creation`);
      return;
    }

    const label = this.config.issue_labels[severity];
    const title = `Code Review Issues - ${severity.toUpperCase()} Severity`;
    
    let body = `## Code Review Results\n\n`;
    body += `**Branch:** ${this.branchName}\n`;
    body += `**Source Branch:** ${this.sourceBranch}\n`;
    body += `**Commit:** ${this.sha}\n`;
    body += `**Severity:** ${severity.toUpperCase()}\n\n`;
    
    body += `### Issues Found:\n\n`;
    
    for (const fileIssue of fileIssues) {
      body += `#### 📁 ${fileIssue.file}\n\n`;
      
      for (const issue of fileIssue.issues) {
        body += `**${issue.severity.toUpperCase()}** - ${issue.description}\n`;
        if (issue.line) body += `*Line: ${issue.line}*\n`;
        if (issue.recommendation) body += `*Recommendation: ${issue.recommendation}*\n`;
        body += `\n`;
      }
    }
    
    body += `---\n`;
    body += `*This issue was automatically created by the Code Review Bot*`;

    try {
      const { data: issue } = await this.octokit.rest.issues.create({
        owner: this.repository.split('/')[0],
        repo: this.repository.split('/')[1],
        title: title,
        body: body,
        labels: [label.name]
      });

      console.log(`Created issue #${issue.number}: ${title}`);
      return issue;
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
    }
  }

  async run() {
    console.log(`Starting code review for branch: ${this.branchName}`);
    console.log(`Source branch: ${this.sourceBranch}`);
    
    const changedFiles = await this.getChangedFiles();
    console.log(`Found ${changedFiles.length} changed files`);
    
    const filteredFiles = this.filterFiles(changedFiles);
    console.log(`After filtering: ${filteredFiles.length} files to review`);
    
    if (filteredFiles.length === 0) {
      console.log('⚠️  No changed files detected. This might happen if:');
      console.log('   - Files were moved/renamed');
      console.log('   - Only configuration files changed');
      console.log('   - Diff detection failed');
      console.log('🔄 Attempting to analyze recent files as fallback...');
      
      // Fallback: analyze recent files in the repository
      const recentFiles = await this.getRecentFiles();
      if (recentFiles.length > 0) {
        console.log(`📁 Found ${recentFiles.length} recent files to analyze`);
        const reviewResults = await this.reviewCode(recentFiles);
        await this.handleReviewResults(reviewResults);
      } else {
        console.log('❌ No files available for analysis');
      }
      return;
    }
    
    const reviewResults = await this.reviewCode(filteredFiles);
    await this.handleReviewResults(reviewResults);
  }

  async handleReviewResults(reviewResults) {
    console.log(`📊 Review completed. Found issues in ${reviewResults.length} files`);
    
    if (reviewResults.length > 0) {
      // Determine overall severity
      const severities = reviewResults.flatMap(r => r.issues.map(i => i.severity));
      const severityLevels = { low: 1, medium: 2, high: 3 };
      const maxSeverity = severities.reduce((max, severity) => 
        severityLevels[severity] > severityLevels[max] ? severity : max, 'low'
      );
      
      console.log(`🚨 Overall severity: ${maxSeverity.toUpperCase()}`);
      console.log(`📝 Creating GitHub issue...`);
      
      const issue = await this.createGitHubIssue(reviewResults, maxSeverity);
      
      // Check if we should block
      const branchConfig = this.config.branches[this.branchName.toLowerCase()];
      if (branchConfig && branchConfig.blocking && maxSeverity === 'high') {
        console.log('🛑 BLOCKING: High severity issues found in main branch');
        process.exit(1);
      } else {
        console.log('✅ Code review completed - no blocking issues');
      }
    } else {
      console.log('✅ No issues found - code review passed!');
    }
    
    console.log('🎉 Code review completed successfully');
  }
}

// Main execution
if (require.main === module) {
  const branchName = process.argv[2];
  if (!branchName) {
    console.error('Please provide branch name as argument');
    process.exit(1);
  }
  
  const bot = new CodeReviewBot();
  bot.run().catch(error => {
    console.error('Code review failed:', error);
    process.exit(1);
  });
}

module.exports = CodeReviewBot;
