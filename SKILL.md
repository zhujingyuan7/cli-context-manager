---
name: cli-context-manager
description: "AI CLI coding tools session context manager - automatically compresses oversized session files to prevent no-reply issues"
version: 1.0.1
---

# CLI Context Manager

**自动管理AI CLI coding工具的上下文，防止无回复问题**

## 何时激活

当出现以下情况时激活此技能：
- AI CLI coding tool（如Claude Code、Aider、OpenCode等）没有回复（replies=0）
- 用户需要管理或清理CLI工具的会话上下文
- 会话文件过大导致性能问题
- 用户询问如何优化CLI工具的上下文

## 技能描述

本技能提供通用的AI CLI coding工具上下文管理功能，支持：
- 自动监控会话状态和大小
- 智能压缩过大的会话文件
- 保留重要消息和配置
- 兼容多种AI CLI工具（Claude Code、Aider、OpenCode等）

## 工作流程

### 1. 检测问题

当检测到 `replies=0` 时，检查：
- 会话文件大小（默认阈值：500KB）
- 会话消息数量（默认阈值：300行）
- 最近是否有活跃消息

### 2. 定位会话文件

根据不同的AI CLI工具，自动查找会话文件：

| 工具 | 会话路径 |
|------|----------|
| Cursor | `~/.cursor/sessions/*.jsonl` |
| Aider | `~/.aider/sessions/*.jsonl` |
| Claude Code | `~/.claude/sessions/*.jsonl` |
| OpenClaw | `~/.openclaw/agents/main/sessions/*.jsonl` |
| 自定义 | 通过CONFIG.json配置 |

### 3. 压缩会话

执行智能压缩：
- 保留最近的N条消息（默认100条）
- 保留系统配置信息（前5行）
- 删除中间的旧消息
- 创建备份文件

### 4. 验证和恢复

- 验证压缩后的文件格式正确
- 检查重要信息是否保留
- 失败时自动恢复备份

## 配置文件

### CONFIG.json

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

## 可用脚本

### `scripts/auto-compress-sessions.ps1` (Windows PowerShell)

自动压缩会话的主脚本。

**使用：**
```bash
powershell -ExecutionPolicy Bypass -File scripts/auto-compress-sessions.ps1
```

**参数：**
- 无参数：使用CONFIG.json中的配置
- 可通过命令行参数覆盖配置

### `scripts/check-session-health.js` (跨平台Node.js)

检查会话健康状态。

**使用：**
```bash
node scripts/check-session-health.js
```

**输出：**
- 会话文件列表及大小
- 是否需要压缩的建议
- 详细的统计信息

### `scripts/compress-session.js` (跨平台Node.js)

跨平台的会话压缩工具。

**使用：**
```bash
node scripts/compress-session.js <session-file>
```

**参数：**
- `--keep-messages N`: 保留的消息数量（默认100）
- `--keep-system N`: 保留的系统行数（默认5）
- `--no-backup`: 不创建备份文件

## 集成到Heartbeat

在 `HEARTBEAT.md` 中添加：

```markdown
## CLI Context Management

当检测到AI CLI工具无回复时：
1. 运行：`powershell -ExecutionPolicy Bypass -File C:\path\to\cli-context-manager\scripts\auto-compress-sessions.ps1`
2. 检查输出，确认会话已压缩
3. 继续正常对话
```

## 故障排除

### 会话压缩后仍然无回复

可能原因：
1. 问题不在会话大小
2. 工具版本兼容性问题
3. 其他配置问题

解决方案：
1. 检查工具的日志文件
2. 验证会话文件格式
3. 尝试重启工具

### 找不到会话文件

可能原因：
1. 会话目录未配置
2. 工具使用不同的会话路径
3. 会话文件格式不是JSONL

解决方案：
1. 更新CONFIG.json中的工具配置
2. 使用 `--session-dir` 参数指定路径
3. 手动查找会话文件位置

## 限制

- 仅支持JSONL格式的会话文件
- 压缩是单向的，无法完全恢复
- 某些工具可能使用加密会话

## 安全注意事项

- 会话文件可能包含敏感信息
- 备份文件应定期清理
- 不要共享会话文件

## 扩展性

如需支持新的AI CLI工具：
1. 在CONFIG.json中添加工具配置
2. 确定会话文件存储位置
3. 验证会话文件格式（应为JSONL）
4. 测试压缩功能
