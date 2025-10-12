---
title: Markdown 扩展功能
published: 2024-05-01
updated: 2024-11-29
description: '阅读有关 Fuwari 中的 Markdown 功能的更多信息'
image: ''
tags: [Demo, Example, Markdown, Fuwari]
category: 'Examples'
draft: false 
---

## GitHub 仓库卡片

您可以添加链接到 GitHub 存储库的动态卡片，在页面加载时，存储库信息将从 GitHub API 中提取。

::github{repo="Fabrizz/MMM-OnSpotify"}

使用代码 `::github{repo="<owner>/<repo>"}` 创建 GitHub 仓库卡片。

```markdown
::github{repo="saicaca/fuwari"}
```

## 警告和提示

支持以下类型的警告： `note` `tip` `important` `warning` `caution`

:::note
突出显示用户应考虑的信息，即使在浏览时也是如此。
:::

:::tip
帮助用户取得更大成功的可选信息。
:::

:::important
用户成功所需的关键信息。
:::

:::warning
由于潜在风险，需要立即用户关注的关键内容。
:::

:::caution
行动的负面潜在后果。
:::

### 基本语法

```markdown
:::note
突出显示用户应考虑的信息，即使在浏览时也是如此。
:::

:::tip
帮助用户取得更大成功的可选信息。
:::
```

### 自定义标题

这些告示的标题可以自定义。

:::note[我的自定义标题]
这是带有自定义标题的 note 。
:::

```markdown
:::note[我的自定义标题]
这是带有自定义标题的 note 。
:::
```

### GitHub 语法

> [!TIP]
> 还支持 [GitHub 语法](https://github.com/orgs/community/discussions/16925) 。

```
> [!NOTE]
> The GitHub syntax is also supported.

> [!TIP]
> The GitHub syntax is also supported.
```

### Spoiler

您可以在文本中添加 Spoiler 。 文本还支持 **Markdown** 语法。

这是一个 :spoiler[隐藏的 **内容**]!

```markdown
这是一个 :spoiler[隐藏的 **内容**]!

```