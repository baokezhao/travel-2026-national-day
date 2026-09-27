# 旅行网站多文件重构 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `gen.py` 生成的单文件 `index.html` 重构为 `index.html` + `style.css` + `data.js` + `app.js` 四文件结构，功能不变，同时优化体验、视觉、性能。

**Architecture:** 纯静态网页，无框架、无构建工具。数据层（`data.js`）与逻辑层（`app.js`）通过全局变量分离，表现层（`style.css`/`index.html`）独立。行程数据是单一数据源，调整功能修改它后同步重渲染所有页面。

**Tech Stack:** HTML5 + CSS3（CSS 变量）+ 原生 JavaScript（ES6），无外部依赖。

**Spec:** [docs/superpowers/specs/2026-09-27-travel-site-refactor-design.md](../specs/2026-09-27-travel-site-refactor-design.md)

## Global Constraints

- 功能完全不变：总览、行程、账本、地图、Vlog、调整六个标签页全部保留
- 配色保持莫兰迪浅色风格，颜色值不变（`--red:#c05e3f` 等）
- 数据内容不变：8 天行程、30 笔费用、景点词典原样迁移
- 无外部依赖，无构建工具，无测试框架
- 部署目标：GitHub Pages 多文件部署（`index.html` 在仓库根目录）
- 加载顺序：`data.js` 在 `app.js` 之前

## Review Focus

| # | 失败模式 | 期望行为 | 归属任务 |
|---|---------|---------|---------|
| 1 | CSS 提取遗漏某条样式 | 所有页面视觉与重构前一致 | Task 1 |
| 2 | JS 函数提取遗漏（如调整、账本） | 六个标签页所有交互正常 | Task 3 |
| 3 | 数据提取遗漏某天行程或某笔费用 | 时间轴 8 天、账本 30 笔齐全 | Task 2 |
| 4 | HTML 引用路径错误（`style.css`/`app.js` 404） | 页面有样式、有交互 | Task 4 |
| 5 | 全局变量名在 data.js 与 app.js 间冲突 | 数据不被逻辑覆盖 | Task 2/3 |

---

### Task 1: 提取 CSS 到 style.css

**Files:**
- Create: `style.css`
- Modify: `gen.py`（标记 CSS 段落已提取，供后续任务对照）

**Interfaces:**
- Consumes: `gen.py` 第 16-228 行的 `w('...')` CSS 定义
- Produces: `style.css`，供 `index.html` 通过 `<link rel="stylesheet" href="style.css">` 引用

- [ ] **Step 1: 从 gen.py 提取全部 CSS 到 style.css**

把 `gen.py` 中从 `# ===== 复用 CSS` 到 `w('  </style>')` 之前的所有 `w('...')` 里的 CSS 内容提取出来，逐条写入 `style.css`，按功能分区加注释（`:root` 变量、导航、section、banner、手风琴、图表、时间轴、线路、每日卡片、地图流程图、Vlog、账本、调整、模态、响应式）。

- [ ] **Step 2: 验证 CSS 完整性**

Run: `grep -o 'w(' gen.py | wc -l` 记录 CSS 段落的 `w()` 条数，再 `grep -c '}' style.css` 对比花括号配对数。
Expected: style.css 的花括号对数与 gen.py CSS 段落里的 `{}` 数量一致（CSS 语法闭合）。

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "refactor: 提取 CSS 到 style.css"
```

---

### Task 2: 提取数据到 data.js

**Files:**
- Create: `data.js`
- Modify: `gen.py`（标记数据段落已提取）

**Interfaces:**
- Consumes: `gen.py` 中的 `DEFAULT_TRIP`、`presetExpenses`、`adjSights`、`adjEmoji`、`tips`、`vlog_days` 数据
- Produces: 全局变量 `DEFAULT_TRIP`、`presetExpenses`、`adjSights`、`adjEmoji`、`TIPS`、`VLOG_DAYS`，供 `app.js` 读取

- [ ] **Step 1: 提取数据到 data.js**

把 `gen.py` 中行程数据（8 天 `DEFAULT_TRIP`）、费用数据（30 笔 `presetExpenses`）、景点词典（`adjSights`/`adjEmoji`）、提醒文案（`tips`）、Vlog 文案（`vlog_days`）提取到 `data.js`，用 `const` 声明为全局变量。变量名：`DEFAULT_TRIP`、`presetExpenses`、`adjSights`、`adjEmoji`、`TIPS`、`VLOG_DAYS`。

- [ ] **Step 2: 验证 JS 语法**

Run: `node --check data.js`
Expected: 无输出（语法通过）

- [ ] **Step 3: 验证数据完整性**

Run: `node -e "require('./data.js'); console.log(DEFAULT_TRIP.length, presetExpenses.length)"`
Expected: `8 30`（8 天行程、30 笔费用）

- [ ] **Step 4: Commit**

```bash
git add data.js
git commit -m "refactor: 提取数据到 data.js"
```

---

### Task 3: 提取逻辑到 app.js

**Files:**
- Create: `app.js`
- Modify: `gen.py`（标记 JS 逻辑段落已提取）

**Interfaces:**
- Consumes: `data.js` 的全局变量（`DEFAULT_TRIP`、`presetExpenses`、`adjSights`、`adjEmoji`、`TIPS`、`VLOG_DAYS`）
- Produces: 渲染函数（`renderTimeline`、`renderRoutes`、`renderDays`、`renderMap`、`renderOverviewCharts`、`renderLedger`、`renderAll`）、交互函数（`addNote`、`addExpense`、`applyAdjust`、`resetTrip` 等）、初始化（`loadTrip`、`loadExpenses`、`loadNotes`）

- [ ] **Step 1: 提取 JS 逻辑到 app.js**

把 `gen.py` 中 `<script>` 内的所有 JS（标签切换、渲染函数、备注、调整、账本、图表、手风琴、初始化）提取到 `app.js`。将 `gen.py` 中硬编码的 `tips`/`vlog_days` 数据引用改为读取 `data.js` 的 `TIPS`/`VLOG_DAYS`。

- [ ] **Step 2: 验证 JS 语法**

Run: `node --check app.js`
Expected: 无输出（语法通过）

- [ ] **Step 3: 验证依赖全局变量存在**

Run: `node -e "global.DEFAULT_TRIP=[];global.presetExpenses=[];global.adjSights={};global.adjEmoji={};global.TIPS=[];global.VLOG_DAYS=[];require('./app.js')"`（会因 DOM 缺失报错，但报错前无 `ReferenceError: DEFAULT_TRIP is not defined` 即可）
Expected: 报错为 DOM 相关（如 `document is not defined`），而非数据变量未定义

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "refactor: 提取逻辑到 app.js"
```

---

### Task 4: 重写 index.html 为纯 HTML

**Files:**
- Modify: `index.html`（重写：去掉内联 `<style>` 和 `<script>`，改为引用外部文件）

**Interfaces:**
- Consumes: `style.css`、`data.js`、`app.js`
- Produces: `index.html`，`<head>` 引用 `style.css`，`<body>` 末尾依次引用 `data.js`、`app.js`

- [ ] **Step 1: 重写 index.html**

保留 `gen.py` 中所有 HTML 结构（banner、手风琴信息卡、图表容器、时间轴容器、tips、账本表单、地图容器、vlog 静态内容、调整表单），删除内联 `<style>...</style>` 和 `<script>...</script>`，在 `<head>` 加 `<link rel="stylesheet" href="style.css">`，在 `<body>` 末尾加 `<script src="data.js"></script><script src="app.js"></script>`。动态内容容器（`timelineBox`、`routesBox`、`daysBox`、`mapBox` 等）保留空容器。

- [ ] **Step 2: 验证引用路径**

Run: `grep -E 'href="style.css"|src="data.js"|src="app.js"' index.html`
Expected: 三条引用都存在，且路径为相对路径（无 `/` 前缀）

- [ ] **Step 3: 本地打开验证**

Run: `cd /Users/bankzhao/Documents/travel-2026-national-day && python3 -m http.server 8899`，浏览器打开 `http://localhost:8899/`
Expected: 页面有样式（莫兰迪配色）、导航可切换、时间轴/地图已渲染

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "refactor: 重写 index.html 为纯 HTML 引用外部文件"
```

---

### Task 5: 清理废弃文件 + README + 最终验证

**Files:**
- Delete: `gen.py`、`apple-style.html`、`build.py`、`standalone.html`
- Create: `README.md`

**Interfaces:**
- Consumes: 前面 4 个任务的全部产物
- Produces: 干净的仓库 + README 说明

- [ ] **Step 1: 删除废弃文件**

Run: `rm gen.py apple-style.html build.py standalone.html`

- [ ] **Step 2: 编写 README.md**

内容：项目简介、文件结构说明、本地预览方法（`python3 -m http.server`）、更新方法（直接编辑对应文件，推送到 GitHub）。

- [ ] **Step 3: 全功能验证（对应 Review Focus 五条）**

逐项检查：① 各页视觉与重构前一致；② 六个标签页切换、调整联动、账本增删、备注、手风琴全部正常；③ 时间轴 8 天、账本 30 笔；④ 样式和脚本加载正常；⑤ 无变量冲突导致的异常。

- [ ] **Step 4: 推送 GitHub Pages**

```bash
git add -A
git commit -m "refactor: 清理废弃文件并添加 README"
git -c http.version=HTTP/1.1 push
```
Expected: 推送成功，`https://baokezhao.github.io/travel-2026-national-day/` 线上正常

---

## Self-Review 记录

- **Spec coverage:** spec 的四文件结构、四优化方向、删除范围、验证方式均有对应任务 ✓
- **Step scan:** 每步一个可检查的动作，无"TBD"或含糊步骤 ✓
- **Type consistency:** `DEFAULT_TRIP`/`presetExpenses` 等变量名在 Task 2 定义、Task 3 消费，一致 ✓
- **Review Focus:** 五条失败模式分别对应 Task 1/3/2/4/2-3 的验证步骤 ✓
- **Proportion:** 计划长度与 spec 相当，未转录代码 ✓
