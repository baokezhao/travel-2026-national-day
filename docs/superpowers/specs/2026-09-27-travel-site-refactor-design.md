# 旅行网站多文件重构设计

日期：2026-09-27

## 背景与目标

当前项目是一个 2026 年国庆重庆·成都旅行计划网页，由 Python 脚本 `gen.py` 用 546 个 `w()` 调用把 CSS、HTML、JS 硬编码成字符串，生成单文件 `index.html`（67KB）。

问题：
- CSS/JS 硬编码在 Python 字符串里，无语法高亮、无法用格式化工具
- 数据（行程、费用）与渲染逻辑混在一起
- 遗留 3 个废弃文件（`apple-style.html`、`build.py`、`standalone.html`）
- 单文件无法利用浏览器缓存

目标：拆成职责单一的多文件结构，同时优化体验、视觉、性能。部署方式已确定为 GitHub Pages 多文件部署，不再需要"单文件双击打开"能力。

## 目标文件结构

```
travel-2026-national-day/
├── index.html      # 纯 HTML 结构（语义化标签，无内联 style/script）
├── style.css       # CSS 样式（格式化、注释分区、CSS 变量系统化）
├── data.js         # 数据层（行程、费用、景点词典、静态文案）
├── app.js          # 逻辑层（渲染、交互、账本、调整、初始化）
└── README.md       # 项目说明与更新方法
```

删除：`gen.py`、`apple-style.html`、`build.py`、`standalone.html`。

## 各部分职责

### index.html
- 纯静态 HTML 骨架，引用 `<link>` 加载 `style.css`，`<script>` 加载 `data.js` 和 `app.js`（按此顺序）
- 语义化标签：`<nav>`（导航）、`<main>`（主内容）、`<section>`（各标签页）、`<details>/<summary>`（手风琴卡片）
- 保留静态内容：banner、手风琴信息卡、图表容器、出行提醒、账本表单、vlog 静态内容、调整表单
- 动态内容（时间轴、线路、日程、地图）留空容器，由 app.js 渲染

### style.css
- 从 `gen.py` 提取全部 CSS，格式化、按功能分区加注释
- CSS 变量系统化（颜色、字体、间距、圆角、阴影）
- 保留莫兰迪配色与浅色设计风格
- 统一动画时长与缓动曲线

### data.js
- `DEFAULT_TRIP`：8 天行程数据（每天含景点流程 spots、固定活动 fixed、天气、城市、颜色）
- `presetExpenses`：30 笔预置费用
- `adjSights` / `adjEmoji`：景点词典（用于智能调整的语义匹配）
- `tips`、`vlogDays`：静态文案
- 通过全局变量暴露给 app.js

### app.js
- 渲染函数：`renderTimeline`、`renderRoutes`、`renderDays`、`renderMap`、`renderOverviewCharts`、`renderLedger`、`renderAll`
- 交互：标签切换、手风琴、备注、账本增删、智能调整、恢复默认
- 初始化：`loadTrip`、`loadExpenses`、`loadNotes`、`renderAll`

## 数据流

1. 页面加载 → `data.js` 定义全局数据 → `app.js` 读取并初始化
2. 行程数据单一数据源（`trip`），持久化到 localStorage
3. 调整功能修改 `trip` → 调用 `renderAll()` → 时间轴、线路、日程、地图同步重渲染

## 四个优化方向

### 1. 代码结构与维护性
- 数据（`data.js`）与逻辑（`app.js`）分离，表现（`style.css`/`index.html`）独立
- CSS/JS 获得编辑器语法高亮与格式化支持
- 删除废弃文件

### 2. 用户体验与功能
- 导航切换、页面进入已有动画，统一缓动曲线
- 移动端点击区域、间距优化（已有媒体查询，微调）
- 语义化标签提升无障碍（屏幕阅读器可读）

### 3. 视觉设计
- CSS 变量系统化：间距、圆角、阴影、颜色统一管理
- 卡片 hover/active 过渡统一
- 配色保持莫兰迪浅色风格

### 4. 性能与加载
- 分离后 `style.css`、`app.js`、`data.js` 可被浏览器缓存，二次访问更快
- 移除内联冗余，减小 HTML 体积
- 无外部依赖（Leaflet 已移除）

## 验证方式

1. 本地 `python3 -m http.server` 打开，逐页检查功能
2. 验证调整联动：输入"10月5日不去三星堆了"，检查时间轴、线路、日程、地图同步
3. 验证账本增删、备注、手风琴、地图流程图
4. 移动端（iPhone 宽度）检查响应式
5. 推送 GitHub Pages，检查线上链接

## 范围外

- 不新增功能（仅优化现有功能的组织与体验）
- 不改动现有配色风格与数据内容
