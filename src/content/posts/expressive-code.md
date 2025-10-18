---
title: 富有表现力的代码示例
published: 2024-04-10
description: 使用表达性代码的代码块来优化 Markdown 的外观。
tags: [Markdown, 语法, Fuwari]
category: Examples
draft: false
---

在这里，我们将探讨如何使用 [表达性代码](https://expressive-code.com/)。 提供的示例基于官方文档，您可以参考这些文档了解更多详细信息。

## 富有表现力的代码 

### 语法突出显示（高亮）

[语法高亮](https://expressive-code.com/key-features/syntax-highlighting/)

#### 常规语法突出显示

```js
console.log('This code is syntax highlighted!')
```

:::note[在 Markdown 中这样写：]
```markdown ins={"1":1} ins={"2":3}
‎```js
‎console.log('This code is syntax highlighted!')
‎```
```
:::

---

#### 渲染 ANSI 转义序列

```ansi
ANSI colors:
- Regular: [31mRed[0m [32mGreen[0m [33mYellow[0m [34mBlue[0m [35mMagenta[0m [36mCyan[0m
- Bold:    [1;31mRed[0m [1;32mGreen[0m [1;33mYellow[0m [1;34mBlue[0m [1;35mMagenta[0m [1;36mCyan[0m
- Dimmed:  [2;31mRed[0m [2;32mGreen[0m [2;33mYellow[0m [2;34mBlue[0m [2;35mMagenta[0m [2;36mCyan[0m

256 colors (showing colors 160-177):
[38;5;160m160 [38;5;161m161 [38;5;162m162 [38;5;163m163 [38;5;164m164 [38;5;165m165[0m
[38;5;166m166 [38;5;167m167 [38;5;168m168 [38;5;169m169 [38;5;170m170 [38;5;171m171[0m
[38;5;172m172 [38;5;173m173 [38;5;174m174 [38;5;175m175 [38;5;176m176 [38;5;177m177[0m

Full RGB colors:
[38;2;34;139;34mForestGreen - RGB(34, 139, 34)[0m

Text formatting: [1mBold[0m [2mDimmed[0m [3mItalic[0m [4mUnderline[0m
```

---

### 编辑器 & 终端

[编辑器 & 终端](https://expressive-code.com/key-features/frames/)

#### 编辑器样式

- 可以通过加上 `title="xxx.xx"` 做到：

```js title="my-test-file.js"
console.log('Title attribute example')
```

:::note[在 Markdown 中这样写：]
```markdown "title="my-test-file.js""
‎```js title="my-test-file.js"
‎console.log('Title attribute example')
‎```
```
:::

- 而html文件可以直接在代码里注释文件路径，这个注释不会在代码中显示出来，但是会读取并当做编辑器标签

```html
<!-- src/content/index.html -->
<div>File name comment example</div>
```

:::note[在 Markdown 中这样写：]
```markdown "<!-- src/content/index.html -->"
‎```html
‎<!-- src/content/index.html -->
‎<div>File name comment example</div>
‎```
```
:::

---

#### 终端样式

- 在渲染出来的终端中显示代码：

```bash
echo "This terminal frame has no title"
```

:::note[在 Markdown 中这样写：]
```markdown "bash"
‎```bash
‎echo "This terminal frame has no title"
‎```
```
:::

- 带上标题同样是使用 `title="xxx"`

```powershell title="PowerShell terminal example"
Write-Output "This one has a title!"
```

:::note[在 Markdown 中这样写：]
```markdown "powershell" "title="PowerShell terminal example""
‎```powershell title="PowerShell terminal example"
‎Write-Output "This one has a title!"
‎```
```
:::

---

#### 覆盖原有框架

- 不使用渲染的终端窗口显示代码，可以用 `frame="none"`：

```sh frame="none"
echo "Look ma, no frame!"
```

:::note[在 Markdown 中这样写：]
```markdown "sh" "frame="none""
‎```sh frame="none"
‎echo "Look ma, no frame!"
‎```
```
:::

- 自定义一下可以做到：

```ps frame="code" title="PowerShell Profile.ps1"
# Without overriding, this would be a terminal frame
function Watch-Tail { Get-Content -Tail 20 -Wait $args }
New-Alias tail Watch-Tail
```

:::note[在 Markdown 中这样写：]
```markdown
‎```ps frame="code" title="PowerShell Profile.ps1"
‎# Without overriding, this would be a terminal frame
‎function Watch-Tail { Get-Content -Tail 20 -Wait $args }
‎New-Alias tail Watch-Tail
‎```
```
:::

---

### 文本和线条标记

[文本和线条标记](https://expressive-code.com/key-features/text-markers/)

#### 标记整行 & 行范围

- 使用 `{}` 括起需要标记的行号和行范围，之间用 `,` 隔开

```js {1, 4, 7-8}
// Line 1 - targeted by line number
// Line 2
// Line 3
// Line 4 - targeted by line number
// Line 5
// Line 6
// Line 7 - targeted by range "7-8"
// Line 8 - targeted by range "7-8"
```

:::note[在 Markdown 中这样写：]
```markdown /{.*}/
‎```js {1, 4, 7-8}
‎// Line 1 - targeted by line number
‎// Line 2
‎// Line 3
‎// Line 4 - targeted by line number
‎// Line 5
‎// Line 6
‎// Line 7 - targeted by range "7-8"
‎// Line 8 - targeted by range "7-8"
‎```
```
:::

---

- 展示行号不是必须的。关闭展示行号后仍然可以用行号定位：

```js showLineNumbers=false {1, 4, 7-8}
// Line 1 - targeted by line number
// Line 2
// Line 3
// Line 4 - targeted by line number
// Line 5
// Line 6
// Line 7 - targeted by range "7-8"
// Line 8 - targeted by range "7-8"
```

:::note[在 Markdown 中这样写：]
```markdown "showLineNumbers=false" /{.*}/
‎```js showLineNumbers=false {1, 4, 7-8}
‎// Line 1 - targeted by line number
‎// Line 2
‎// Line 3
‎// Line 4 - targeted by line number
‎// Line 5
‎// Line 6
‎// Line 7 - targeted by range "7-8"
‎// Line 8 - targeted by range "7-8"
‎```
```
:::

---

#### 选择线标记类型（mark、ins、del）

- 标记的时候可以标记这行代码是新添加进来还是删除的，只需要分别为它们添加标识 `ins=` 和 `del=`。不添加的会保持原样：

```js title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
  console.log('this line is marked as deleted')
  // This line and the next one are marked as inserted
  console.log('this is the second inserted line')

  return 'this line uses the neutral default marker type'
}
```

:::note[在 Markdown 中这样写：]
```markdown "del={2}" "ins={3-4}" "{6}"
‎```js title="line-markers.js" del={2} ins={3-4} {6}
‎function demo() {
‎  console.log('this line is marked as deleted')
‎  // This line and the next one are marked as inserted
‎  console.log('this is the second inserted line')
‎
‎  return 'this line uses the neutral default marker type'
‎}
‎```
```
:::

---

#### 向线标记添加标签 

- 在 `{}` 内写入标签名，冒号后面跟上行号(标签名太长会遮住代码)：

```jsx {"1":5} del={"2":7-8} ins={"3":10-12} ins={"标签A":15} ins={"标签B":16}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}
  value={value}
  className={buttonClassName}
  disabled={disabled}
  active={active}
>
  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
<button>
  <span>abc</span>
      <span>abc</span>
</button>
```

:::note[在 Markdown 中这样写：]
```markdown "{"1":5}" "del={"2":7-8}" "ins={"3":10-12}" "ins={"标签A":15}" "ins={"标签B":16}"
‎```jsx {"1":5} del={"2":7-8} ins={"3":10-12} ins={"标签A":15} ins={"标签B":16}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}
  value={value}
  className={buttonClassName}
  disabled={disabled}
  active={active}
>
  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
<button>
<span>abc</span>
      <span>abc</span>
</button>
‎```
```
:::

:::warning[关于行号]
从上面这个例子也可以看出行号是从源码中开始数的。开头的
```jsx showLineNumbers=false
‎// labeled-line-markers.jsx
```
也算进行号里面，但在展示时这行忽略并提取成了文件名，所以导致展示的行号和标记的行号不一致。
:::

---

#### 在单独的行上添加长标签

- 前面提到，标签太长会遮住代码，如果一定要写长标签，就在那一行上方留出一个空行，将两行一起标起来：

```jsx {"1. Provide the value prop here:":5-6} del={"2. Remove the disabled and active states:":8-10} ins={"3. Add this to render the children inside the button:":12-15}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}

  value={value}
  className={buttonClassName}

  disabled={disabled}
  active={active}
>

  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
```

:::note[在 Markdown 中这样写：]
```markdown "{"1. Provide the value prop here:":5-6}" "del={"2. Remove the disabled and active states:":8-10}" "ins={"3. Add this to render the children inside the button:":12-15}" ins={6,9,13}
‎```jsx {"1. Provide the value prop here:":5-6} del={"2. Remove the disabled and active states:":8-10} ins={"3. Add this to render the children inside the button:":12-15}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}

  value={value}
  className={buttonClassName}

  disabled={disabled}
  active={active}
>

  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
‎```
```
:::

---

#### 也可以使用类似 diff 的语法

```diff
+this line will be marked as inserted
-this line will be marked as deleted
this is a regular line
```

:::note[在 Markdown 中这样写：]
```markdown
‎```diff
+this line will be marked as inserted
-this line will be marked as deleted
this is a regular line
‎```
```
:::

- 或者这样：

```diff
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
+this is an actual diff file
-all contents will remain unmodified
 no whitespace will be removed either
```

:::note[在 Markdown 中这样写：]
```markdown
‎```diff
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
+this is an actual diff file
-all contents will remain unmodified
 no whitespace will be removed either
‎```
```
:::

---

#### 将语法突出显示与类似 diff 的语法相结合

```diff lang="js"
  function thisIsJavaScript() {
    // This entire block gets highlighted as JavaScript,
    // and we can still add diff markers to it!
-   console.log('Old code to be removed')
+   console.log('New and shiny code!')
  }
```

:::note[在 Markdown 中这样写：]
```markdown
‎```diff  lang="js"
  function thisIsJavaScript() {
    // This entire block gets highlighted as JavaScript,
    // and we can still add diff markers to it!
-   console.log('Old code to be removed')
+   console.log('New and shiny code!')
  }
‎```
```
:::

---

#### 在行内标记单个文本

- 这我前面一直在用。

```js "given text"
function demo() {
  // Mark any given text inside lines
  return 'Multiple matches of the given text are supported';
}
```

:::note[在 Markdown 中这样写：]
```markdown ""given text""
‎```js "given text"
function demo() {
  // Mark any given text inside lines
  return 'Multiple matches of the given text are supported';
}
‎```
```
:::

:::caution[注意不要他妈这么写：]
```markdown """"
‎```js ""
function demo() {
  // Mark any given text inside lines
  return 'Multiple matches of the given text are supported';
}
‎```
```
这对空白引号会泄露内存，然后把你的网站搞崩掉。
这在 Expressive Code 的 内联文本标记（inline text markers） 语法中会被解析为：“标记所有空字符串”。

但由于空字符串在每一行都“匹配无数次”（比如行首、行中、行尾的零宽位置），Expressive Code 会尝试为每一个匹配位置生成标记节点，导致：

+ AST 节点爆炸式增长；
+ 内存占用急剧上升；
+ 最终触发 JavaScript heap out of memory。

这本质上是一个 边界情况下的解析陷阱，虽然语法上合法，但语义上无意义且极具破坏性。

> 所以不要写空引号 `""` 和空正则 `//` (下面会讲)
:::

---

#### 正则表达式

```ts /ye[sp]/
console.log('The words yes and yep will be marked.')
```

:::note[在 Markdown 中这样写：]
```markdown "/ye[sp]/"
‎```ts /ye[sp]/
console.log('The words yes and yep will be marked.')
‎```
```
:::

---

#### 转义正斜杠

```sh /\/ho.*\//
echo "Test" > /home/test.txt
```

:::note[在 Markdown 中这样写：]
```markdown {1}
‎```sh /\/ho.*\//
echo "Test" > /home/test.txt
‎```
```
:::

---

#### 选择内联标记类型（mark、ins、del）

```js "return true;" ins="inserted" del="deleted"
function demo() {
  console.log('These are inserted and deleted marker types');
  // The return statement uses the default marker type
  return true;
}
```

:::note[在 Markdown 中这样写：]
```markdown ""return true;"" "ins="inserted"" "del="deleted""
‎```js "return true;" ins="inserted" del="deleted"
function demo() {
  console.log('These are inserted and deleted marker types');
  // The return statement uses the default marker type
  return true;
}
‎```
```
:::

---

### 自动换行

[自动换行](https://expressive-code.com/key-features/word-wrap/)

#### 配置每个块的自动换行 

```js wrap
// Example with wrap
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

:::note[在 Markdown 中这样写：]
```markdown "js wrap"
‎```js wrap
// Example with wrap
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
‎```
```
:::

---

```js wrap=false
// Example with wrap=false
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

:::note[在 Markdown 中这样写：]
```markdown "js wrap=false"
‎```js wrap=false
// Example with wrap=false
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
‎```
```
:::

---

#### 配置换行的缩进

```js wrap preserveIndent
// Example with preserveIndent (enabled by default)
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

:::note[在 Markdown 中这样写：]
```markdown "js wrap preserveIndent"
‎```js wrap preserveIndent
// Example with preserveIndent (enabled by default)
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
‎```
```
:::


```js wrap preserveIndent=false
// Example with preserveIndent=false
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

:::note[在 Markdown 中这样写：]
```markdown "js wrap preserveIndent=false"
‎```js wrap preserveIndent=false
// Example with preserveIndent=false
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
‎```
```
:::

---

## 可折叠部分

[可折叠部分](https://expressive-code.com/plugins/collapsible-sections/)

- 用 `collapse={}` 来设置哪些行号被折叠：

```js collapse={1-5, 12-14, 21-24}
// All this boilerplate setup code will be collapsed
import { someBoilerplateEngine } from '@example/some-boilerplate'
import { evenMoreBoilerplate } from '@example/even-more-boilerplate'

const engine = someBoilerplateEngine(evenMoreBoilerplate())

// This part of the code will be visible by default
engine.doSomething(1, 2, 3, calcFn)

function calcFn() {
  // You can have multiple collapsed sections
  const a = 1
  const b = 2
  const c = a + b

  // This will remain visible
  console.log(`Calculation result: ${a} + ${b} = ${c}`)
  return c
}

// All this code until the end of the block will be collapsed again
engine.closeConnection()
engine.freeMemory()
engine.shutdown({ reason: 'End of example boilerplate code' })
```

:::note[在 Markdown 中这样写：]
```markdown "collapse={1-5, 12-14, 21-24}"
‎```js collapse={1-5, 12-14, 21-24}
// All this boilerplate setup code will be collapsed
import { someBoilerplateEngine } from '@example/some-boilerplate'
import { evenMoreBoilerplate } from '@example/even-more-boilerplate'

const engine = someBoilerplateEngine(evenMoreBoilerplate())

// This part of the code will be visible by default
engine.doSomething(1, 2, 3, calcFn)

function calcFn() {
  // You can have multiple collapsed sections
  const a = 1
  const b = 2
  const c = a + b

  // This will remain visible
  console.log(`Calculation result: ${a} + ${b} = ${c}`)
  return c
}

// All this code until the end of the block will be collapsed again
engine.closeConnection()
engine.freeMemory()
engine.shutdown({ reason: 'End of example boilerplate code' })
‎```
```
:::

---

## 行号

[行号](https://expressive-code.com/plugins/line-numbers/)

### 显示每个块的行号

- 可以用 `showLineNumbers`，也可以不用（默认显示行号）

```js showLineNumbers
// This code block will show line numbers
console.log('Greetings from line 2!')
console.log('I am on line 3')
```

:::note[在 Markdown 中这样写：]
```markdown "showLineNumbers"
‎```js showLineNumbers
// This code block will show line numbers
console.log('Greetings from line 2!')
console.log('I am on line 3')
‎```
```
:::

---

### 或者不显示行号

- 需要额外设置 `showLineNumbers=false`：

```js showLineNumbers=false
// Line numbers are disabled for this block
console.log('Hello?')
console.log('Sorry, do you know what line I am on?')
```

:::note[在 Markdown 中这样写：]
```markdown "showLineNumbers=false"
‎```js showLineNumbers=false
// Line numbers are disabled for this block
console.log('Hello?')
console.log('Sorry, do you know what line I am on?')
‎```
```
:::

---

### 更改起始行号

- 设置 `startLineNumber=5`

```js showLineNumbers startLineNumber=5
console.log('Greetings from line 5!')
console.log('I am on line 6')
```

:::note[在 Markdown 中这样写：]
```markdown "startLineNumber=5"
‎```js showLineNumbers startLineNumber=5
console.log('Greetings from line 5!')
console.log('I am on line 6')
‎```
```
:::



这篇文章在fuwari示例文档的基础上翻译并添加了许多内容。

‎

‎

‎

‎

‎
