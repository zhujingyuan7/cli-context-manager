# CLI Context Manager

> 自动管理AI CLI coding工具的上下文，防止无回复问题 / Automatically manage AI CLI coding tool context to prevent no-reply issues / AI CLIコーディングツールのコンテキストを自動管理し、無応答問題を防止

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)

---

## 📖 简介 / Introduction / 紹介

**CLI Context Manager** 是一个通用的 OpenClaw 技能，用于自动管理和优化 AI CLI coding 工具的会话上下文。通过智能压缩过大的会话文件，可以有效避免因上下文过大导致的无回复问题。

**CLI Context Manager** is a universal OpenClaw skill for automatically managing and optimizing session contexts of AI CLI coding tools. By intelligently compressing oversized session files, it effectively prevents no-reply issues caused by excessive context.

**CLI Context Manager** は、AI CLIコーディングツールのセッションコンテキストを自動的に管理・最適化する汎用的なOpenClawスキルです。過大なセッションファイルをインテリジェントに圧縮することで、コンテキスト過多による無応答問題を効果的に防止します。

---

## ✨ 特性 / Features / 機能

- ✅ **通用兼容** - 支持市面主流 AI CLI coding 工具（Cursor、Aider、Claude Code等）
- ✅ **智能压缩** - 自动检测并压缩过大的会话文件
- ✅ **多平台支持** - 提供 PowerShell 和 Node.js 脚本
- ✅ **可配置性** - 灵活的配置选项满足不同需求
- ✅ **安全可靠** - 自动备份，失败可恢复
- ✅ **易于集成** - 无缝集成到 OpenClaw Heartbeat 系统

---

- ✅ **Universal Compatibility** - Supports mainstream AI CLI coding tools (Cursor, Aider, Claude Code, etc.)
- ✅ **Intelligent Compression** - Automatically detects and compresses oversized session files
- ✅ **Cross-Platform** - Provides PowerShell and Node.js scripts
- ✅ **Configurable** - Flexible configuration options for different needs
- ✅ **Safe & Reliable** - Automatic backup with rollback capability
- ✅ **Easy Integration** - Seamlessly integrates with OpenClaw Heartbeat system

---

- ✅ **汎用互換性** - 市場の主要なAI CLIコーディングツール（Cursor、Aider、Claude Codeなど）をサポート
- ✅ **インテリジェント圧縮** - 過大なセッションファイルを自動的に検出・圧縮
- ✅ **クロスプラットフォーム** - PowerShellとNode.jsスクリプトを提供
- ✅ **設定可能** - 柔軟な構成オプションで様々なニーズに対応
- ✅ **安全・信頼性** - 自動バックアップとロールバック機能
- ✅ **簡単統合** - OpenClaw Heartbeatシステムにシームレスに統合

---

## 🎯 支持的工具 / Supported Tools / サポートされるツール

| 工具 / Tool | ツール | 状态 / Status | 状態 |
|------------|---------|--------------|-----|
| Cursor | カーソル | ✅ 完全支持 / Fully Supported | 完全にサポート |
| Aider | エイダー | ✅ 完全支持 / Fully Supported | 完全にサポート |
| Claude Code | クロードコード | ✅ 完全支持 / Fully Supported | 完全にサポート |
| OpenClaw | オープンクロー | ✅ 完全支持 / Fully Supported | 完全にサポート |
| 自定义工具 / Custom Tools | カスタムツール | ✅ 支持配置 / Configurable | 設定可能 |

---

## 📦 安装 / Installation / インストール

### 方式一：直接使用 / Method 1: Direct Use / 方法1：直接使用

```bash
# 克隆仓库 / Clone repository / リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/cli-context-manager.git

# 进入目录 / Enter directory / ディレクトリに移動
cd cli-context-manager

# 配置工具路径（可选）/ Configure tool paths (optional) / ツールのパスを設定（オプション）
# 编辑 CONFIG.json / Edit CONFIG.json / CONFIG.jsonを編集
```

### 方式二：作为OpenClaw Skill / Method 2: As OpenClaw Skill / 方法2：OpenClaw Skillとして

```bash
# 复制到OpenClaw skills目录 / Copy to OpenClaw skills directory / OpenClaw skillsディレクトリにコピー
cp -r cli-context-manager ~/.openclaw/skills/

# 或者在Windows上 / Or on Windows / またはWindows上で
xcopy /E /I cli-context-manager %USERPROFILE%\.openclaw\skills\cli-context-manager
```

---

## ⚙️ 配置 / Configuration / 設定

编辑 `CONFIG.json` 文件来自定义行为：

Edit the `CONFIG.json` file to customize behavior:

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

### 配置说明 / Configuration Options / 設定オプション

| 参数 / Parameter | パラメータ | 说明 / Description | 説明 |
|-----------------|-----------|------------------|-----|
| `maxSizeKB` | 最大サイズKB | 触发压缩的文件大小阈值（KB） | 圧縮をトリガーするファイルサイズのしきい値（KB） |
| `maxLines` | 最大行数 | 触发压缩的行数阈值 | 圧縮をトリガーする行数のしきい値 |
| `keepMessages` | 保持消息数 | 压缩后保留的消息数量 | 圧縮後に保持するメッセージ数 |
| `keepSystemLines` | 保持系统行 | 压缩后保留的系统配置行数 | 圧縮後に保持するシステム構成行数 |
| `createBackup` | 创建备份 | 是否在压缩前创建备份文件 | 圧縮前にバックアップファイルを作成するかどうか |

---

## 🚀 使用方法 / Usage / 使用方法

### 自动模式 / Automatic Mode / 自動モード

在 `HEARTBEAT.md` 中添加以下内容：

Add the following to `HEARTBEAT.md`:

`HEARTBEAT.md` に以下を追加：

```markdown
## CLI Context Management

When AI CLI tool has no replies (replies=0):
# 当AI CLI工具无回复时（replies=0）：
# AI CLIツールが応答しない場合（replies=0）：

powershell -ExecutionPolicy Bypass -File C:\path\to\cli-context-manager\scripts\auto-compress-sessions.ps1
```

### 手动模式 / Manual Mode / 手動モード

#### Windows PowerShell

```powershell
# 进入脚本目录 / Enter script directory / スクリプトディレクトリに移動
cd C:\path\to\cli-context-manager

# 自动压缩所有会话 / Auto compress all sessions / すべてのセッションを自動圧縮
powershell -ExecutionPolicy Bypass -File scripts\auto-compress-sessions.ps1
```

#### macOS/Linux (Node.js)

```bash
# 进入脚本目录 / Enter script directory / スクリプトディレクトリに移動
cd /path/to/cli-context-manager

# 检查会话健康状态 / Check session health / セッションの健全性をチェック
node scripts/check-session-health.js

# 压缩指定会话 / Compress specific session / 特定のセッションを圧縮
node scripts/compress-session.js ~/.cursor/sessions/session-id.jsonl

# 压缩时指定参数 / Compress with parameters / パラメータを指定して圧縮
node scripts/compress-session.js session.jsonl --keep-messages 50 --no-backup
```

---

## 📊 工作流程 / Workflow / ワークフロー

```
检测问题
  ↓
查找会话文件
  ↓
检查大小和行数
  ↓
是否超过阈值? --否--> 结束 / 完成
  ↓是
创建备份
  ↓
智能压缩
  ↓
验证结果
  ↓
清理备份
  ↓
完成 / 完成
```

---

## 🔍 故障排除 / Troubleshooting / トラブルシューティング

### 问题1：压缩后仍然无回复 / Issue 1: Still no reply after compression / 問題1：圧縮後も応答なし

**可能原因 / Possible Causes / 考えられる原因：**
- 问题不在会话大小
- 工具版本兼容性问题
- 其他配置问题

**解决方案 / Solutions / 解決策：**
```bash
# 检查工具日志 / Check tool logs / ツールログを確認
tail -f ~/.tool/logs/current.log

# 验证会话格式 / Verify session format / セッション形式を確認
node scripts/check-session-health.js --verify

# 重启工具 / Restart tool / ツールを再起動
killall tool-name && tool-name
```

### 问题2：找不到会话文件 / Issue 2: Session file not found / 問題2：セッションファイルが見つからない

**可能原因 / Possible Causes / 考えられる原因：**
- 会话目录未配置
- 工具使用不同的路径
- 会话文件格式不是JSONL

**解决方案 / Solutions / 解決策：**
```bash
# 查找会话文件 / Find session files / セッションファイルを検索
find ~ -name "*.jsonl" -type f

# 更新配置 / Update configuration / 設定を更新
# 编辑 CONFIG.json / Edit CONFIG.json / CONFIG.jsonを編集

# 指定会话目录 / Specify session directory / セッションディレクトリを指定
node scripts/compress-session.js --session-dir /custom/path/session.jsonl
```

### 问题3：备份文件占用空间 / Issue 3: Backup files占用ing space / 問題3：バックアップファイルが容量を消費

**解决方案 / Solutions / 解決策：**
```bash
# 清理所有备份 / Clean all backups / すべてのバックアップをクリーンアップ
rm ~/.tool/sessions/*.backup

# 或使用脚本 / Or use script / またはスクリプトを使用
node scripts/clean-backups.js
```

---

## 🔒 安全注意事项 / Security Notes / セキュリティ注意事項

⚠️ **重要警告 / Important Warning / 重要な警告：**

- **会话文件可能包含敏感信息** - 包括代码、API密钥、个人信息等
- **不要共享会话文件** - 尤其是备份文件
- **定期清理备份文件** - 避免敏感信息泄露
- **使用版本控制时排除会话文件** - 在 `.gitignore` 中添加 `*.jsonl` 和 `*.backup`

⚠️ **会話ファイルには機密情報が含まれる可能性があります** - コード、APIキー、個人情報など
⚠️ **会話ファイルを共有しないでください** - 特にバックアップファイル
⚠️ **定期的にバックアップファイルをクリーンアップしてください** - 機密情報の漏洩を防ぐ
⚠️ **バージョン管理時には会話ファイルを除外してください** - `.gitignore` に `*.jsonl` と `*.backup` を追加

---

## 🛠️ 扩展性 / Extensibility / 拡張性

### 支持新的AI CLI工具 / Support new AI CLI tools / 新しいAI CLIツールをサポート

1. 确定会话文件位置 / Determine session file location / セッションファイルの場所を特定
2. 验证文件格式（应为JSONL）/ Verify file format (should be JSONL) / ファイル形式を確認（JSONLである必要があります）
3. 在 `CONFIG.json` 中添加配置 / Add configuration in `CONFIG.json` / `CONFIG.json` に設定を追加
4. 测试压缩功能 / Test compression function / 圧縮機能をテスト

**示例 / Example / 例：**

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

### 自定义压缩策略 / Custom compression strategies / カスタム圧縮戦略

可以修改 `scripts/compress-session.js` 来实现自定义压缩逻辑：

You can modify `scripts/compress-session.js` to implement custom compression logic:

`scripts/compress-session.js` を変更してカスタム圧縮ロジックを実装できます：

```javascript
// 保留特定关键词的消息 / Keep messages with specific keywords / 特定のキーワードを含むメッセージを保持
if (message.content.includes('important')) {
  keep = true;
}
```

---

## 📝 开发路线图 / Roadmap / ロードマップ

- [ ] 支持更多会话格式（如JSON、SQLite）/ Support more session formats (JSON, SQLite, etc.)
- [ ] 添加Web UI界面 / Add Web UI interface / Web UIインターフェースの追加
- [ ] 实现智能消息保留策略（基于重要性评分）/ Implement smart message retention (based on importance scoring) / 重要度スコアに基づくスマートメッセージ保持の実装
- [ ] 添加监控和告警功能 / Add monitoring and alerting / モニタリングとアラート機能の追加
- [ ] 支持云存储备份 / Support cloud storage backups / クラウドストレージバックアップのサポート

---

## 🤝 贡献 / Contributing / コントリビューション

欢迎贡献！请遵循以下步骤：

Contributions are welcome! Please follow these steps:

コントリビューションを歓迎します！以下の手順に従ってください：

1. Fork 本仓库 / Fork this repository / リポジトリをフォーク
2. 创建特性分支 / Create feature branch / 機能ブランチを作成
3. 提交更改 / Commit changes / 変更をコミット
4. 推送到分支 / Push to branch / ブランチにプッシュ
5. 创建Pull Request / Create Pull Request / Pull Requestを作成

---

## 📄 许可证 / License / ライセンス

MIT License - 详见 [LICENSE](LICENSE) 文件 / See [LICENSE](LICENSE) file for details / 詳細は [LICENSE](LICENSE) ファイルを参照

---

## 📞 联系方式 / Contact / 連絡先

- **作者 / Author / 作成者**: 小7 <xiao7@openclaw.ai>
- **GitHub**: [https://github.com/YOUR_USERNAME/cli-context-manager](https://github.com/YOUR_USERNAME/cli-context-manager)
- **问题反馈 / Issues / バグ報告**: [GitHub Issues](https://github.com/YOUR_USERNAME/cli-context-manager/issues)

---

## 🙏 致谢 / Acknowledgments / 謝辞

感谢所有贡献者和支持者！

Thanks to all contributors and supporters!

すべてのコントリビューターとサポーターに感謝します！

---

<div align="center">

**[⬆ 回到顶部 / Back to top / トップに戻る](#cli-context-manager)**

Made with ❤️ by [小7](https://github.com/YOUR_USERNAME)

</div>
