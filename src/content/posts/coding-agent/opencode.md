---
title: OpenCode & Oh My OpenAgent 完整部署文档
published: 2026-05-01
description: "iflow 弃用下新的 agent 方案"
tags: ["coding agent", 教程]
category: 实用工具
draft: false
---

# 📦 OpenCode & Oh My OpenAgent 完整部署文档

## 🛠️ 前置环境要求
- 操作系统：Windows 10/11 (推荐 PowerShell)、macOS 或 Linux
- Node.js ≥ v20.x
- Git 已安装
- 终端环境：PowerShell / Bash / Zsh

## 🚀 第一步：安装 OpenCode 主程序
### 方式 A：npm 全局安装（推荐）
```powershell
npm install -g opencode-ai@latest
```

### 方式 B：一键脚本安装（macOS/Linux）
```bash
curl -fsSL https://opencode.ai/install | bash
```

### 验证安装
```powershell
opencode --version
opencode --help
```

## 🐇 第二步：安装 Bun 运行时（插件依赖）
> Oh My OpenAgent 依赖 Bun 环境，请先安装 Bun。

### Windows 一键安装
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"

# 或

npm install -g bun # 只需要这一个 `npm` 命令
```

### macOS / Linux 一键安装
```bash
curl -fsSL https://bun.sh/install | bash
```

### 验证 Bun 安装
```powershell
bun --version
```
> 💡 若提示命令未找到，请重启终端，或将 `%USERPROFILE%\.bun\bin` (Windows) / `~/.bun/bin` (macOS/Linux) 加入系统 PATH 环境变量。

## 🎨 第三步：安装 Oh My OpenAgent
> ⚠️ 注：原 `oh-my-opencode` 已正式更名为 `oh-my-openagent`，旧包已弃用，请使用新包名。

### 一键安装命令
```powershell
bunx oh-my-openagent install
```

### 安装过程说明
1. 自动下载插件至用户配置目录 `~/.config/opencode/plugins/`
2. 自动将插件注册写入 OpenCode 主配置文件
3. 安装完成后直接启动 OpenCode 即可自动加载插件

## ⚙️ 第四步：初始化与模型配置
### 首次启动向导（推荐）
```powershell
opencode
```
启动后按终端提示交互操作：
- 选择 AI 提供商（OpenAI / Claude / Ollama / DeepSeek / 其他兼容接口）
- 粘贴对应 API Key
- 选择默认对话模型

### 手动配置文件（进阶）
配置文件路径：`~/.config/opencode/opencode.json`
```jsonc
{
"model": {
"provider": "openai",
"name": "gpt-4o",
"apiKey": "${env:OPENAI_API_KEY}",
"baseUrl": "https://api.openai.com/v1"
},
"plugins": [
{ "name": "oh-my-openagent", "enabled": true }
]
}
```

## ✅ 第五步：功能验证与基础使用
```powershell
# 1. 启动交互界面
opencode

# 2. 检查当前模型连接状态
/whoami

# 3. 测试 Oh My OpenAgent 插件状态
/omo status
/agents list

# 4. 切换工作模式（按 Tab 键或输入命令）
/plan → 切换到规划模式（只分析不执行）
/build → 切换到构建模式（直接改文件/执行命令）
```

## 🐛 常见问题排查
| 现象 | 解决方案 |
|---|---|
| `opencode: command not found` | 检查 Node.js 全局路径，或改用 `npx opencode` 启动 |
| `bun: command not found` | 重启终端，或手动将 Bun 安装路径加入系统环境变量 |
| `oh-my-openagent: command not found` | 确认已使用 `bunx` 而非 `npx`，旧包名已失效 |
| API 连接超时/报错 | 检查网络代理配置，或切换至本地 Ollama 模型测试 |
| 修改配置后不生效 | 确保 JSON 语法无误，修改环境变量后必须彻底重启终端窗口 |

## 📝 核心注意事项
- 🔒 **安全规范**：严禁将 API Key 明文写入配置文件，务必使用 `${env:变量名}` 或 `.env` 文件隔离密钥。
- 🔄 **名称统一**：社区已全面迁移至 `oh-my-openagent`，所有教程、命令、仓库地址请以新名称为准。
- 💡 **工作流建议**：复杂需求务必遵循 `先 /plan 规划 → 确认方案 → 再 /build 执行` 的流程，大幅降低误改代码风险。
- 🌐 **国内加速**：若 npm/bun 下载超时，可在命令后追加 `--registry=https://registry.npmmirror.com`，或使用合规网络工具。

🎉 部署完成！现在可在任意项目目录下输入 `opencode` 开始 AI 辅助编程。