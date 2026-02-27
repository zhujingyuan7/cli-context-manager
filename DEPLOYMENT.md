# 部署指南 / Deployment Guide / デプロイガイド

本指南帮助将 CLI Context Manager 上传到 GitHub。

This guide helps upload CLI Context Manager to GitHub.

このガイドは、CLI Context ManagerをGitHubにアップロードするためのものです。

---

## 📋 前置条件 / Prerequisites / 前提条件

### 选项一：使用 GitHub CLI（推荐）/ Option 1: Using GitHub CLI (Recommended) / オプション1：GitHub CLIを使用（推奨）

```bash
# 安装 GitHub CLI / Install GitHub CLI / GitHub CLIをインストール
# macOS: brew install gh
# Windows: winget install --id GitHub.cli
# Linux: 查看官方文档 / See official docs / 公式ドキュメントを参照

# 认证 / Authenticate / 認証
gh auth login

# 创建仓库 / Create repository / リポジトリを作成
gh repo create cli-context-manager --public --source=. --remote=origin --push
```

### 选项二：手动创建 / Option 2: Manual Creation / オプション2：手動作成

#### 1. 创建 GitHub 仓库 / Create GitHub Repository / GitHubリポジトリを作成

1. 访问 https://github.com/new / Visit https://github.com/new / https://github.com/new にアクセス
2. 输入仓库名：`cli-context-manager` / Enter repository name: `cli-context-manager` / リポジトリ名を入力：`cli-context-manager`
3. 选择公开或私有 / Choose public or private / 公開またはプライベートを選択
4. **不要**初始化 README / **Do not** initialize README / READMEを初期化しないでください
5. 点击 "Create repository" / Click "Create repository" / 「Create repository」をクリック

#### 2. 推送到 GitHub / Push to GitHub / GitHubにプッシュ

```bash
cd "C:\工作\Vibe Coding\cli-context-manager"

# 添加远程仓库 / Add remote repository / リモートリポジトリを追加
# 将 YOUR_USERNAME 替换为你的 GitHub 用户名
# Replace YOUR_USERNAME with your GitHub username
# YOUR_USERNAMEをGitHubのユーザー名に置き換えてください
git remote add origin https://github.com/YOUR_USERNAME/cli-context-manager.git

# 推送到 GitHub / Push to GitHub / GitHubにプッシュ
git branch -M main
git push -u origin main
```

#### 3. 添加 GitHub Releases / Add GitHub Releases / GitHub Releasesを追加

```bash
# 使用 GitHub CLI / Use GitHub CLI / GitHub CLIを使用
gh release create v1.0.0 \
  --title "CLI Context Manager v1.0.0" \
  --notes "Initial release

Features:
- Universal AI CLI tool session management
- Automatic session compression
- Support for Cursor, Aider, Claude Code, OpenClaw
- Cross-platform support
- Comprehensive test suite"
```

---

## 🎯 推送后的配置 / Post-Push Configuration / プッシュ後の設定

### 1. 设置仓库主题 / Set Repository Topics / リポジトリトピックを設定

在 GitHub 仓库设置中添加以下主题：

On GitHub repository settings, add these topics:

GitHubリポジトリ設定に以下のトピックを追加：

```
openclaw, ai-cli, session-management, cursor, aider, claude-code, context-compression
```

### 2. 设置仓库描述 / Set Repository Description / リポジトリ説明を設定

```
Automatically manage AI CLI coding tool context to prevent no-reply issues
自动管理AI CLI coding工具的上下文，防止无回复问题
AI CLIコーディングツールのコンテキストを自動管理し、無応答問題を防止
```

### 3. 启用 GitHub Pages（可选）/ Enable GitHub Pages (Optional) / GitHub Pagesを有効にする（オプション）

如果需要文档站点：

If you want a documentation site:

ドキュメントサイトが必要な場合：

1. 进入 Settings → Pages / Go to Settings → Pages / Settings → Pages に移動
2. 选择 Branch: main / Select Branch: main / ブランチ：mainを選択
3. 点击 Save / Click Save / 「Save」をクリック

---

## 🏷️ 许可证 / License / ライセンス

本项目使用 MIT License。已在 `LICENSE` 文件中声明。

This project uses MIT License. Declared in `LICENSE` file.

このプロジェクトはMITライセンスを使用します。`LICENSE`ファイルで宣言されています。

---

## 📧 支持 / Support / サポート

如有问题，请在 GitHub Issues 中提交。

For any issues, please submit to GitHub Issues.

問題がある場合は、GitHub Issuesに送信してください。

- GitHub: https://github.com/YOUR_USERNAME/cli-context-manager/issues

---

## ✅ 验证部署 / Verify Deployment / デプロイの検証

```bash
# 检查远程仓库 / Check remote repository / リモートリポジトリを確認
git remote -v

# 检查分支 / Check branch / ブランチを確認
git branch -a

# 查看最近的提交 / View recent commits / 最近のコミットを表示
git log --oneline -5
```

---

<div align="center">

**[⬆ 回到顶部 / Back to top / トップに戻る](../README.md)**

</div>
