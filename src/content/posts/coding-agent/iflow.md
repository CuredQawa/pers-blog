---
title: iflow 完整部署文档
published: 2026-02-21
description: "coding agent 解放双手 AI编程build项目"
tags: ["coding agent", 教程]
category: 实用工具
draft: false
---

# iFlow CLI 下载安装与配置指南

> 文档版本：v1.0 | 最后更新：2026-02-21 | 适用系统：Windows / macOS / Linux

## 📋 目录

- [✨ 产品简介](#-产品简介)
- [🔧 环境准备](#-环境准备)
- [📦 安装步骤](#-安装步骤)
- [🔑 登录认证](#-登录认证)
- [✅ 验证安装](#-验证安装)
- [⚠️ 常见问题](#-常见问题)
- [🚀 快速开始](#-快速开始)

## ✨ 产品简介

**iFlow CLI** 是由阿里心流团队推出的终端 AI 编程助手，支持免费使用 Qwen3-Coder、Kimi K2、DeepSeek 等强大模型。

### 核心特性

- 🤖 支持多模型切换：Qwen3-Coder / Kimi-K2 / DeepSeek-v3 / GLM-4.5
- 💰 完全免费：官方提供免费额度，无需绑定信用卡
- 🇨🇳 国内优化：专为中文开发者设计，网络连接稳定
- 🔐 安全可控：支持多种权限模式，代码本地处理
- 🧩 可扩展：支持 MCP 协议和 SubAgent 插件系统

## 🔧 环境准备

### 前置依赖

| 依赖项 | 最低版本 | 验证命令 |
|--------|----------|----------|
| Node.js | v16.x+ | `node --version` |
| npm | v8.x+ | `npm --version` |
| Git | v2.x+ | `git --version` |

### 安装 Node.js（如未安装）

#### Windows / macOS

1. 访问官网：https://nodejs.org/
2. 下载 **LTS 版本** 安装包
3. 双击安装，保持默认选项即可

#### Linux (Ubuntu/Debian)

```bash
# 使用 NodeSource 安装最新版 LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## 📦 安装步骤

### 方式一：全局安装（推荐）

```bash
# 使用 npm 全局安装最新版 iFlow CLI
npm install -g @iflow-ai/iflow-cli@latest
```

### 方式二：指定版本安装

```bash
# 安装特定版本（如 0.5.13）
npm install -g @iflow-ai/iflow-cli@0.5.13
```

### 方式三：使用 yarn / pnpm

```bash
# yarn
yarn global add @iflow-ai/iflow-cli@latest

# pnpm
pnpm add -g @iflow-ai/iflow-cli@latest
```

### ⚠️ 关于安装警告的说明

安装过程中可能出现如下 `npm warn deprecated` 提示：

```
npm warn deprecated phin@3.7.1: Package no longer supported...
npm warn deprecated request@2.88.2: request has been deprecated...
```

**这些警告来自第三方依赖包，不影响 iFlow CLI 的正常使用，可安全忽略。**

## 🔑 登录认证

安装完成后，首次使用需要进行身份认证。

### 步骤 1：启动 iFlow

```bash
iflow
```

### 步骤 2：选择登录方式（二选一）

#### 🌟 方式 A：网页授权登录（推荐）

1. 在终端菜单中选择 `Login with iFlow`
2. 系统自动打开浏览器，跳转至官方登录页
3. 使用手机号或邮箱完成注册/登录
4. 授权成功后，终端会自动获取 Token 并登录

#### 🔑 方式 B：API Key 登录

1. 访问平台：https://platform.iflow.cn
2. 进入「个人设置」→「API Keys」
3. 点击「生成新 Key」，复制生成的密钥
4. 回到终端，选择 `Login with API Key` 并粘贴密钥

> 💡 API Key 有效期为 7 天，建议定期更新以保障安全。

## ✅ 验证安装

### 检查版本

```bash
iflow --version
```

预期输出示例：

```
0.5.13
```

### 检查帮助信息

```bash
iflow --help
```

预期输出应包含：

```
Usage: iflow [options] [command]

Options:
 -V, --version 输出版本号
 -m, --mode 设置运行模式 (default/plan/accept-edit/yolo)
 -h, --help 显示帮助信息

Commands:
 init 初始化项目，生成 IFLOW.md
 auth 重新认证或切换账号
 subcommand 管理扩展命令插件
```

## ⚠️ 常见问题

### ❌ 问题 1：`iflow` 命令未找到

**原因**：npm 全局安装路径未加入系统 PATH 环境变量。

**解决方案**：

```bash
# 1. 查看 npm 全局安装路径
npm config get prefix

# 2. Windows PowerShell：将路径加入环境变量
# 例如：C:\Users\<用户名>\AppData\Roaming\npm

# 3. macOS/Linux：在 ~/.bashrc 或 ~/.zshrc 中添加
export PATH="$PATH:$(npm config get prefix)/bin"
source ~/.bashrc # 或 source ~/.zshrc
```

### ❌ 问题 2：登录页面无法打开

**原因**：网络限制或浏览器拦截。

**解决方案**：

- 改用 **API Key 登录** 方式，无需跳转浏览器
- 检查防火墙/代理设置，确保可访问 `platform.iflow.cn`
- 尝试使用无痕模式或更换浏览器

### ❌ 问题 3：AI 响应超时或失败

**解决方案**：

```bash
# 1. 检查网络连接
ping apis.iflow.cn

# 2. 切换更稳定的模型（编辑配置文件）
# 文件路径：~/.iflow/settings.json
{
 "modelName": "Qwen3-Coder",
 "baseUrl": "https://apis.iflow.cn/v1"
}

# 3. 清除缓存后重试
iflow /clear
```

### ❌ 问题 4：权限不足无法执行命令

**原因**：当前运行模式限制了文件修改或命令执行。

**解决方案**：

```bash
# 启动时指定更高权限模式（谨慎使用）
iflow --mode accept-edit # 允许修改文件，需人工确认
iflow --mode yolo # 最大权限：自动执行所有操作

# 或手动执行命令后让 AI 分析结果
!git status
```

## 🚀 快速开始

### 第一步：进入项目目录

```bash
cd E:\your-project
```

### 第二步：启动并初始化

```bash
iflow
# 在交互界面中输入：
> /init
```

`/init` 命令会扫描项目结构，自动生成 `IFLOW.md` 上下文文档，帮助 AI 更好理解你的代码。

### 第三步：下达第一个指令

```
> 帮我分析这个项目的架构，并建议如何添加用户登录功能
```

### 常用快捷操作

| 操作 | 说明 |
|------|------|
| `@文件路径` | 引用文件内容供 AI 分析，如 `@src/main.py` |
| `!命令` | 在 CLI 内直接执行系统命令，如 `!npm test` |
| `/clear` | 清空对话历史，节省 Token |
| `Tab` 键 | 自动补全命令或文件路径 |
| `Ctrl + C` | 中断当前任务 |

## 📚 官方资源

- 🌐 官网平台：https://platform.iflow.cn
- 📖 CLI 文档：https://platform.iflow.cn/cli/
- 💬 社区论坛：https://vibex.iflow.cn/
- 🐙 GitHub 仓库：https://github.com/iflow-ai/iflow-cli
- 📄 中文 README：https://github.com/iflow-ai/iflow-cli/blob/main/README_CN.md

---

> 💡 **小提示**：按 `Tab` 键可以自动补全命令和文件路径，大幅提升操作效率！

---

*本文档由 iFlow CLI v0.5.13 实测编写，如有更新请以官方文档为准。*