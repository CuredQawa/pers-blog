---
title: Roop 项目实现本地 ai 换脸
published: 2025-11-29
description: "已经停止维护的 ai 换脸项目，有时识别不是很准确，勉强能用"
tags: ["Roop", 教程, 本地工具]
category: AI & ML
draft: false
---

# Roop AI 换脸工具本地部署完整入门指南（源码版）

> 本指南适用于 Windows 用户，使用 **Git 克隆源码 + Python 虚拟环境 + 手动模型配置** 的方式部署 [Roop](https://github.com/s0md3v/roop)（s0md3v 开发的轻量级 AI 换脸工具）。
> 项目已停止维护，但仍可稳定运行。

## 前提说明

Roop 是一个基于 ONNX 和 InsightFace 的实时人脸交换工具，仅需一张源人脸图片即可完成换脸。
它**不要求训练、不要求 GPU**（CPU 即可运行），但首次使用需下载两个核心模型：
- `inswapper_128.onnx`：人脸交换模型（~528 MB）
- `buffalo_l`：人脸检测/识别模型（~590 MB）

:::caution[重要提醒]
- 本篇指南由于懒惰的需要，修改了源码，禁用了NSFW检测，使用时请遵守法律法规，**不要用于伪造、诽谤或色情内容**
- 使用真实人物人脸时，请获得授权
- 在互联网上发布生成结果时，请明确标注为 “AI 生成” 或 “Deepfake”
:::

## 🔧 第一步：安装必要软件

### 1. 安装 Python（推荐 3.10 或 3.11）
> 虽然 Roop 可在 Python 3.9 运行，但官方推荐 3.10+。
- 下载地址：https://www.python.org/downloads/
- 安装时务必勾选 **“Add Python to PATH”**

### 2. 安装 Git
- 下载地址：https://git-scm.com/download/win
- 安装时保持默认选项即可

### 3. 安装 FFmpeg
Roop 依赖 FFmpeg 处理视频：
1. 访问 https://www.gyan.dev/ffmpeg/builds/
2. 下载 **`ffmpeg-release-essentials.zip`**
3. 解压到 `D:\tools\ffmpeg`（路径不要含中文或空格）
4. 将 `D:\tools\ffmpeg\bin` 添加到系统 **PATH 环境变量**
5. 打开新 PowerShell，运行 `ffmpeg -version` 验证

## 第二步：使用 Git 克隆 Roop 源码

> 使用终端命令获取源码（更规范、可追踪版本）

```powershell
# 打开 PowerShell，进入你想存放项目的目录
cd D:\

# 克隆官方仓库（注意：项目已归档，但代码仍可用）
git clone https://github.com/s0md3v/roop.git roop-1.3.2

# 进入项目目录
cd roop-1.3.2
```

> 此时你已拥有完整源码，包含 `run.py`、`requirements.txt` 等文件。

## 第三步：创建虚拟环境并安装依赖

为避免污染全局 Python 环境，**强烈建议使用虚拟环境**：

```powershell
# 创建虚拟环境（名称为 venv）
python -m venv venv --upgrade-deps


# 激活虚拟环境
.\venv\Scripts\Activate.ps1
```

> `--upgrade-deps` 参数会自动更新 `pip` 和 `setuptools`，避免“无 pip”问题。

> 如果提示执行策略错误，先运行：
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### 安装依赖

作者原先的电脑上已经装载了 Python 3.9 。所以：

如果你的电脑上已经装载了 Python 3.9 ，刚好不想或者懒得更新，那么你会发现有些依赖在 3.9 下存在兼容性问题。不更新的解决办法是：移除这些依赖以及他们支持的功能（不影响基础使用，但高质量生成可能会受限）

这两个兼容性差的插件是：

`gfpgan` ，移除相关代码会放弃“人脸增强”功能（仅换脸），如果你不需要“高清修复”功能（即只要换脸，不要美化/清晰化），这就无关紧要。

`opennsfw2` ， 是用来检测色情内容的，如果你不会处理敏感内容，完全可以安全禁用。

由于 `gfpgan` 和 `opennsfw2` 在 Python 3.9 下存在兼容性问题，我们移除它们：

1. 用记事本打开 `requirements.txt`
2. **注释或删除以下两行**：
```txt
# gfpgan==1.3.8
# opennsfw2==0.10.2
```

另外，你不需要安装 `tensorflow`（它只是 `opennsfw2` 的依赖），现在也可以从 `requirements.txt` 中彻底删除 `tensorflow==2.13.0` 这一行，减少体积。

3. 保存文件

然后安装依赖（**使用官方 PyPI 源，避免清华源限流**）：

```powershell
pip install --upgrade pip
pip install -r requirements.txt -i https://pypi.org/simple/
```

## 第四步：禁用 NSFW 检测

虽然你注释掉了 `requirements.txt` 中的 `gfpgan` 和 `opennsfw2` ，但是 Roop 的源码 默认集成了 NSFW（成人内容）检测模块，即使你不用它，代码里也会     `import opennsfw2`,导致启动失败。

解决方案：禁用 NSFW 检测（修改源码）

编辑 `roop/predictor.py`，**完全移除 NSFW 逻辑**：

```python
# D:\roop-1.3.2\roop\predictor.py
import threading
import numpy
from PIL import Image
from roop.typing import Frame

# NSFW 检测已完全禁用，所有预测函数直接返回 False（表示“安全”）

def get_predictor():
    return None

def clear_predictor():
    pass

def predict_frame(target_frame: Frame) -> bool:
    return False  # 不检测，视为安全

def predict_image(target_path: str) -> bool:
    return False

def predict_video(target_path: str) -> bool:
    return False
```

> 保存后，程序不再尝试加载 `opennsfw2`，避免 ModuleNotFoundError。

## 第五步：手动下载并放置模型

### 1. 下载 `inswapper_128.onnx`（人脸交换模型）

使用以下链接（无需登录，国内可直连）：
🔗 https://github.com/facefusion/facefusion-assets/raw/main/models/inswapper_128.onnx

下载后，放入 **项目目录下的 `models` 文件夹**：
```
D:\roop-1.3.2\models\inswapper_128.onnx
```
> 如果 `models` 文件夹不存在，请手动创建。

### 2. 下载 `buffalo_l`（人脸分析模型）

访问：
🔗 https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip

下载后：
1. 解压得到 `buffalo_l` 文件夹
2. 放入：
```
C:\Users\<你的用户名>\.insightface\models\buffalo_l\
```
> 注意：`.insightface` 是隐藏文件夹，需在文件资源管理器中开启“显示隐藏项目”。

## 第六步：启动 Roop

### 创建一键启动脚本 `run_roop.bat`

在 `D:\roop-1.3.2\` 下新建文本文件，粘贴以下内容，保存为 `run_roop.bat`：

```bat
@echo off
cd /d "%~dp0"

REM 检查虚拟环境是否存在
if not exist "venv\Scripts\python.exe" (
    echo 错误：虚拟环境未找到！
    echo 请先运行：python -m venv venv
    echo 然后安装依赖：venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

REM 激活虚拟环境并启动 Roop GUI
call venv\Scripts\activate.bat
python run.py

pause
```

### 双击运行

- 双击 `run_roop.bat`
- 弹出 GUI 窗口即表示成功

## 第七步：使用 GUI 换脸

1. **Source image**：选择你的源人脸图片（清晰正面照，英文路径）
2. **Target**：选择目标视频或图片（含人脸）
3. **Output**：指定输出文件（如 `D:\output.mp4`）
4. 点击 **Start**

> 首次运行会加载模型，稍等片刻。处理速度取决于 CPU 性能（通常 1~5 FPS）。

## 常见问题

### Q1: 点击 Start 后卡住？
- 首次运行需加载 `buffalo_l` 模型，耐心等待
- 确保模型路径正确（见第五步）

### Q2: 报错 “No face in source path detected”？
- 换一张更清晰、正面、无遮挡的人脸图片
- 使用纯英文路径（如 `D:\face.jpg`）

### Q3: 模型下载失败？
- 切换到手机热点
- 关闭所有代理/加速器
- 手动下载后放入指定目录

## 🌟 结语

通过 `git clone` 获取源码、虚拟环境隔离依赖、手动配置模型，你已成功部署 Roop。
这种方式更透明、可控，也便于后续调试或修改。

> 🎨 **技术是中立的，责任在于使用者**。请始终以负责任的态度使用 AI 换脸技术。
