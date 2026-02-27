# CLI Context Manager

> **Language / 语言 / 言語：** [🇨🇳 简体中文](#简体中文) | [🇺🇸 English](#english) | [🇯🇵 日本語](#日本語)

---

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)

---

# 简体中文

## 📖 简介

**CLI Context Manager** 是一个通用的 OpenClaw 技能，用于自动管理和优化 AI CLI coding 工具的会话上下文。通过智能压缩过大的会话文件，可以有效避免因上下文过大导致的无回复问题。

## ✨ 特性

- ✅ **通用兼容** - 支持市面主流 AI CLI coding 工具（Cursor、Aider、Claude Code等）
- ✅ **智能压缩** - 自动检测并压缩过大的会话文件
- ✅ **多平台支持** - 提供 PowerShell 和 Node.js 脚本
- ✅ **可配置性** - 灵活的配置选项满足不同需求
- ✅ **安全可靠** - 自动备份，失败可恢复
- ✅ **易于集成** - 无缝集成到 OpenClaw Heartbeat 系统

## 🎯 支持的工具

| 工具 | 状态 |
|------------|--------------|
| Cursor | ✅ 完全支持 |
| Aider | ✅ 完全支持 |
| Claude Code | ✅ 完全支持 |
| OpenClaw | ✅ 完全支持 |
| 自定义工具 | ✅ 支持配置 |

## 📦 安装

### 方式一：直接使用

```bash
# 克隆仓库
git clone https://github.com/zhujingyuan7/cli-context-manager.git

# 进入目录
cd cli-context-manager

# 配置工具路径（可选）
# 编辑 CONFIG.json
```

### 方式二：作为 OpenClaw Skill

```bash
# 复制到 OpenClaw skills 目录
cp -r cli-context-manager ~/.openclaw/skills/

# 或者在 Windows 上
xcopy /E /I cli-context-manager %USERPROFILE%\.openclaw\skills\cli-context-manager
```

## ⚙️ 配置

编辑 `CONFIG.json` 文件来自定义行为：

```json
{
  "thresholds": {
    "maxSizeKB": 500,
    "maxLines": 300
  },
  "compression": {
    "keepMessages": 100,
    "keepSystemLines": 5,
    "createBackup": true
  },
  "tools": {
    "cursor": {
      "sessionDir": "~/.cursor/sessions",
      "enabled": true
    },
    "aider": {
      "sessionDir": "~/.aider/sessions",
      "enabled": true
    },
    "claude-code": {
      "sessionDir": "~/.claude/sessions",
      "enabled": true
    },
    "openclaw": {
      "sessionDir": "~/.openclaw/agents/main/sessions",
      "enabled": true
    }
  }
}
```

### 配置说明

| 参数 | 说明 |
|-----------------|-----------|
| `maxSizeKB` | 触发压缩的文件大小阈值（KB） |
| `maxLines` | 触发压缩的行数阈值 |
| `keepMessages` | 压缩后保留的消息数量 |
| `keepSystemLines` | 压缩后保留的系统配置行数 |
| `createBackup` | 是否在压缩前创建备份文件 |

## 🚀 使用方法

### 自动模式

在 `HEARTBEAT.md` 中添加以下内容：

```markdown
## CLI Context Management

当 AI CLI 工具无回复时（replies=0）：
powershell -ExecutionPolicy Bypass -File C:\path\to\cli-context-manager\scripts\auto-compress-sessions.ps1
```

### 手动模式

#### Windows PowerShell

```powershell
# 进入脚本目录
cd C:\path\to\cli-context-manager

# 自动压缩所有会话
powershell -ExecutionPolicy Bypass -File scripts\auto-compress-sessions.ps1
```

#### macOS/Linux (Node.js)

```bash
# 进入脚本目录
cd /path/to/cli-context-manager

# 检查会话健康状态
node scripts/check-session-health.js

# 压缩指定会话
node scripts/compress-session.js ~/.cursor/sessions/session-id.jsonl

# 压缩时指定参数
node scripts/compress-session.js session.jsonl --keep-messages 50 --no-backup
```

## 📊 工作流程

```
检测问题
  ↓
查找会话文件
  ↓
检查大小和行数
  ↓
是否超过阈值? --否--> 结束
  ↓是
创建备份
  ↓
智能压缩
  ↓
验证结果
  ↓
清理备份
  ↓
完成
```

## 🔍 故障排除

### 问题1：压缩后仍然无回复

**可能原因：**
- 问题不在会话大小
- 工具版本兼容性问题
- 其他配置问题

**解决方案：**
```bash
# 检查工具日志
tail -f ~/.tool/logs/current.log

# 验证会话格式
node scripts/check-session-health.js --verify

# 重启工具
killall tool-name && tool-name
```

### 问题2：找不到会话文件

**可能原因：**
- 会话目录未配置
- 工具使用不同的路径
- 会话文件格式不是 JSONL

**解决方案：**
```bash
# 查找会话文件
find ~ -name "*.jsonl" -type f

# 更新配置
# 编辑 CONFIG.json
```

### 问题3：备份文件占用空间

**解决方案：**
```bash
# 清理所有备份
rm ~/.tool/sessions/*.backup
```

## 🔒 安全注意事项

⚠️ **重要警告：**

- **会话文件可能包含敏感信息** - 包括代码、API密钥、个人信息等
- **不要共享会话文件** - 尤其是备份文件
- **定期清理备份文件** - 避免敏感信息泄露
- **使用版本控制时排除会话文件** - 在 `.gitignore` 中添加 `*.jsonl` 和 `*.backup`

## 🛠️ 扩展性

### 支持新的 AI CLI 工具

1. 确定会话文件位置
2. 验证文件格式（应为 JSONL）
3. 在 `CONFIG.json` 中添加配置
4. 测试压缩功能

**示例：**

```json
{
  "tools": {
    "new-tool": {
      "sessionDir": "~/.new-tool/sessions",
      "enabled": true,
      "format": "jsonl"
    }
  }
}
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

- **作者**: 小7 <xiao7@openclaw.ai>
- **GitHub**: [https://github.com/zhujingyuan7/cli-context-manager](https://github.com/zhujingyuan7/cli-context-manager)
- **问题反馈**: [GitHub Issues](https://github.com/zhujingyuan7/cli-context-manager/issues)

## 🙏 致谢

感谢所有贡献者和支持者！

---

# English

## 📖 Introduction

**CLI Context Manager** is a universal OpenClaw skill for automatically managing and optimizing session contexts of AI CLI coding tools. By intelligently compressing oversized session files, it effectively prevents no-reply issues caused by excessive context.

## ✨ Features

- ✅ **Universal Compatibility** - Supports mainstream AI CLI coding tools (Cursor, Aider, Claude Code, etc.)
- ✅ **Intelligent Compression** - Automatically detects and compresses oversized session files
- ✅ **Cross-Platform** - Provides PowerShell and Node.js scripts
- ✅ **Configurable** - Flexible configuration options for different needs
- ✅ **Safe & Reliable** - Automatic backup with rollback capability
- ✅ **Easy Integration** - Seamlessly integrates with OpenClaw Heartbeat system

## 🎯 Supported Tools

| Tool | Status |
|------------|--------------|
| Cursor | ✅ Fully Supported |
| Aider | ✅ Fully Supported |
| Claude Code | ✅ Fully Supported |
| OpenClaw | ✅ Fully Supported |
| Custom Tools | ✅ Configurable |

## 📦 Installation

### Method 1: Direct Use

```bash
# Clone repository
git clone https://github.com/zhujingyuan7/cli-context-manager.git

# Enter directory
cd cli-context-manager

# Configure tool paths (optional)
# Edit CONFIG.json
```

### Method 2: As OpenClaw Skill

```bash
# Copy to OpenClaw skills directory
cp -r cli-context-manager ~/.openclaw/skills/

# Or on Windows
xcopy /E /I cli-context-manager %USERPROFILE%\.openclaw\skills\cli-context-manager
```

## ⚙️ Configuration

Edit the `CONFIG.json` file to customize behavior:

```json
{
  "thresholds": {
    "maxSizeKB": 500,
    "maxLines": 300
  },
  "compression": {
    "keepMessages": 100,
    "keepSystemLines": 5,
    "createBackup": true
  },
  "tools": {
    "cursor": {
      "sessionDir": "~/.cursor/sessions",
      "enabled": true
    },
    "aider": {
      "sessionDir": "~/.aider/sessions",
      "enabled": true
    },
    "claude-code": {
      "sessionDir": "~/.claude/sessions",
      "enabled": true
    },
    "openclaw": {
      "sessionDir": "~/.openclaw/agents/main/sessions",
      "enabled": true
    }
  }
}
```

### Configuration Options

| Parameter | Description |
|-----------------|-----------|
| `maxSizeKB` | File size threshold for compression (KB) |
| `maxLines` | Line count threshold for compression |
| `keepMessages` | Number of messages to retain after compression |
| `keepSystemLines` | Number of system config lines to retain |
| `createBackup` | Whether to create backup file before compression |

## 🚀 Usage

### Automatic Mode

Add the following to `HEARTBEAT.md`:

```markdown
## CLI Context Management

When AI CLI tool has no replies (replies=0):
powershell -ExecutionPolicy Bypass -File C:\path\to\cli-context-manager\scripts\auto-compress-sessions.ps1
```

### Manual Mode

#### Windows PowerShell

```powershell
# Enter script directory
cd C:\path\to\cli-context-manager

# Auto compress all sessions
powershell -ExecutionPolicy Bypass -File scripts\auto-compress-sessions.ps1
```

#### macOS/Linux (Node.js)

```bash
# Enter script directory
cd /path/to/cli-context-manager

# Check session health
node scripts/check-session-health.js

# Compress specific session
node scripts/compress-session.js ~/.cursor/sessions/session-id.jsonl

# Compress with parameters
node scripts/compress-session.js session.jsonl --keep-messages 50 --no-backup
```

## 📊 Workflow

```
Detect Problem
  ↓
Find Session Files
  ↓
Check Size & Lines
  ↓
Exceeds threshold? --No--> Done
  ↓Yes
Create Backup
  ↓
Intelligent Compression
  ↓
Verify Results
  ↓
Clean Backup
  ↓
Complete
```

## 🔍 Troubleshooting

### Issue 1: Still no reply after compression

**Possible Causes:**
- Problem is not session size
- Tool version compatibility issues
- Other configuration problems

**Solutions:**
```bash
# Check tool logs
tail -f ~/.tool/logs/current.log

# Verify session format
node scripts/check-session-health.js --verify

# Restart tool
killall tool-name && tool-name
```

### Issue 2: Session file not found

**Possible Causes:**
- Session directory not configured
- Tool uses different path
- Session file format is not JSONL

**Solutions:**
```bash
# Find session files
find ~ -name "*.jsonl" -type f

# Update configuration
# Edit CONFIG.json
```

### Issue 3: Backup files consuming space

**Solutions:**
```bash
# Clean all backups
rm ~/.tool/sessions/*.backup
```

## 🔒 Security Notes

⚠️ **Important Warning:**

- **Session files may contain sensitive information** - Including code, API keys, personal data, etc.
- **Do not share session files** - Especially backup files
- **Regularly clean up backup files** - Avoid sensitive information leaks
- **Exclude session files in version control** - Add `*.jsonl` and `*.backup` to `.gitignore`

## 🛠️ Extensibility

### Support new AI CLI tools

1. Determine session file location
2. Verify file format (should be JSONL)
3. Add configuration in `CONFIG.json`
4. Test compression function

**Example:**

```json
{
  "tools": {
    "new-tool": {
      "sessionDir": "~/.new-tool/sessions",
      "enabled": true,
      "format": "jsonl"
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 📞 Contact

- **Author**: 小7 <xiao7@openclaw.ai>
- **GitHub**: [https://github.com/zhujingyuan7/cli-context-manager](https://github.com/zhujingyuan7/cli-context-manager)
- **Issues**: [GitHub Issues](https://github.com/zhujingyuan7/cli-context-manager/issues)

## 🙏 Acknowledgments

Thanks to all contributors and supporters!

---

# 日本語

## 📖 紹介

**CLI Context Manager** は、AI CLIコーディングツールのセッションコンテキストを自動的に管理・最適化する汎用的なOpenClawスキルです。過大なセッションファイルをインテリジェントに圧縮することで、コンテキスト過多による無応答問題を効果的に防止します。

## ✨ 機能

- ✅ **汎用互換性** - 市場の主要なAI CLIコーディングツール（Cursor、Aider、Claude Codeなど）をサポート
- ✅ **インテリジェント圧縮** - 過大なセッションファイルを自動的に検出・圧縮
- ✅ **クロスプラットフォーム** - PowerShellとNode.jsスクリプトを提供
- ✅ **設定可能** - 柔軟な構成オプションで様々なニーズに対応
- ✅ **安全・信頼性** - 自動バックアップとロールバック機能
- ✅ **簡単統合** - OpenClaw Heartbeatシステムにシームレスに統合

## 🎯 サポートされるツール

| ツール | 状態 |
|------------|--------------|
| Cursor | ✅ 完全にサポート |
| Aider | ✅ 完全にサポート |
| Claude Code | ✅ 完全にサポート |
| OpenClaw | ✅ 完全にサポート |
| カスタムツール | ✅ 設定可能 |

## 📦 インストール

### 方法1：直接使用

```bash
# リポジトリをクローン
git clone https://github.com/zhujingyuan7/cli-context-manager.git

# ディレクトリに移動
cd cli-context-manager

# ツールのパスを設定（オプション）
# CONFIG.jsonを編集
```

### 方法2：OpenClaw Skillとして

```bash
# OpenClaw skillsディレクトリにコピー
cp -r cli-context-manager ~/.openclaw/skills/

# またはWindows上で
xcopy /E /I cli-context-manager %USERPROFILE%\.openclaw\skills\cli-context-manager
```

## ⚙️ 設定

`CONFIG.json` ファイルを編集して動作をカスタマイズ：

```json
{
  "thresholds": {
    "maxSizeKB": 500,
    "maxLines": 300
  },
  "compression": {
    "keepMessages": 100,
    "keepSystemLines": 5,
    "createBackup": true
  },
  "tools": {
    "cursor": {
      "sessionDir": "~/.cursor/sessions",
      "enabled": true
    },
    "aider": {
      "sessionDir": "~/.aider/sessions",
      "enabled": true
    },
    "claude-code": {
      "sessionDir": "~/.claude/sessions",
      "enabled": true
    },
    "openclaw": {
      "sessionDir": "~/.openclaw/agents/main/sessions",
      "enabled": true
    }
  }
}
```

### 設定オプション

| パラメータ | 説明 |
|-----------------|-----------|
| `maxSizeKB` | 圧縮をトリガーするファイルサイズのしきい値（KB） |
| `maxLines` | 圧縮をトリガーする行数のしきい値 |
| `keepMessages` | 圧縮後に保持するメッセージ数 |
| `keepSystemLines` | 圧縮後に保持するシステム構成行数 |
| `createBackup` | 圧縮前にバックアップファイルを作成するかどうか |

## 🚀 使用方法

### 自動モード

`HEARTBEAT.md` に以下を追加：

```markdown
## CLI Context Management

AI CLIツールが応答しない場合（replies=0）：
powershell -ExecutionPolicy Bypass -File C:\path\to\cli-context-manager\scripts\auto-compress-sessions.ps1
```

### 手動モード

#### Windows PowerShell

```powershell
# スクリプトディレクトリに移動
cd C:\path\to\cli-context-manager

# すべてのセッションを自動圧縮
powershell -ExecutionPolicy Bypass -File scripts\auto-compress-sessions.ps1
```

#### macOS/Linux (Node.js)

```bash
# スクリプトディレクトリに移動
cd /path/to/cli-context-manager

# セッションの健全性をチェック
node scripts/check-session-health.js

# 特定のセッションを圧縮
node scripts/compress-session.js ~/.cursor/sessions/session-id.jsonl

# パラメータを指定して圧縮
node scripts/compress-session.js session.jsonl --keep-messages 50 --no-backup
```

## 📊 ワークフロー

```
問題を検出
  ↓
セッションファイルを検索
  ↓
サイズと行数を確認
  ↓
しきい値を超えている? --いいえ--> 完了
  ↓はい
バックアップを作成
  ↓
インテリジェント圧縮
  ↓
結果を検証
  ↓
バックアップをクリーンアップ
  ↓
完了
```

## 🔍 トラブルシューティング

### 問題1：圧縮後も応答なし

**考えられる原因：**
- 問題はセッションサイズにない
- ツールのバージョン互換性の問題
- その他の設定問題

**解決策：**
```bash
# ツールログを確認
tail -f ~/.tool/logs/current.log

# セッション形式を検証
node scripts/check-session-health.js --verify

# ツールを再起動
killall tool-name && tool-name
```

### 問題2：セッションファイルが見つからない

**考えられる原因：**
- セッションディレクトリが設定されていない
- ツールが異なるパスを使用している
- セッションファイル形式がJSONLではない

**解決策：**
```bash
# セッションファイルを検索
find ~ -name "*.jsonl" -type f

# 設定を更新
# CONFIG.jsonを編集
```

### 問題3：バックアップファイルが容量を消費

**解決策：**
```bash
# すべてのバックアップをクリーンアップ
rm ~/.tool/sessions/*.backup
```

## 🔒 セキュリティ注意事項

⚠️ **重要な警告：**

- ⚠️ **会話ファイルには機密情報が含まれる可能性があります** - コード、APIキー、個人情報など
- ⚠️ **会話ファイルを共有しないでください** - 特にバックアップファイル
- ⚠️ **定期的にバックアップファイルをクリーンアップしてください** - 機密情報の漏洩を防ぐ
- ⚠️ **バージョン管理時には会話ファイルを除外してください** - `.gitignore` に `*.jsonl` と `*.backup` を追加

## 🛠️ 拡張性

### 新しいAI CLIツールをサポート

1. セッションファイルの場所を特定
2. ファイル形式を確認（JSONLである必要があります）
3. `CONFIG.json` に設定を追加
4. 圧縮機能をテスト

**例：**

```json
{
  "tools": {
    "new-tool": {
      "sessionDir": "~/.new-tool/sessions",
      "enabled": true,
      "format": "jsonl"
    }
  }
}
```

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順に従ってください：

1. リポジトリをフォーク
2. 機能ブランチを作成
3. 変更をコミット
4. ブランチにプッシュ
5. Pull Requestを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 連絡先

- **作成者**: 小7 <xiao7@openclaw.ai>
- **GitHub**: [https://github.com/zhujingyuan7/cli-context-manager](https://github.com/zhujingyuan7/cli-context-manager)
- **バグ報告**: [GitHub Issues](https://github.com/zhujingyuan7/cli-context-manager/issues)

## 🙏 謝辞

すべてのコントリビューターとサポーターに感謝します！

---

<div align="center">

**[🇨🇳 简体中文](#简体中文) | [🇺🇸 English](#english) | [🇯🇵 日本語](#日本語)**

Made with ❤️ by [小7](https://github.com/zhujingyuan7)

</div>
