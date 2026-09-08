# zjcgitdemo 代码问题分析报告

> 分析对象：`dev` 分支（`d4b859e`），共 5 个文件
> 分析日期：2026-09-08
> 标注为【已验证】的问题均通过 Node.js 实际运行复现确认

## 问题总览

| # | 严重度 | 问题 | 位置 |
|---|--------|------|------|
| 1 | 🔴 P0 严重 | `escapeHtml` 未定义，首页搜索必然崩溃 | js/main.js:37 |
| 2 | 🟠 P1 高 | quickSort 固定取末位基准，有序输入导致栈溢出 | js/sorting.js:23 |
| 3 | 🟠 P1 高 | innerHTML 拼接未转义，存在注入隐患 | js/main.js:37,46,47,52 |
| 4 | 🟡 P2 中 | 搜索区分大小写，体验不一致 | js/main.js:28-34 |
| 5 | 🟡 P2 中 | sorting.js 注释与实现不符，浏览器下无法运行 | js/sorting.js:1,51 |
| 6 | 🟢 P3 低 | 搜索框状态未按注释恢复，注释与实现不符 | js/main.js:127-130 |
| 7 | 🟢 P3 低 | 文章详情页的搜索框输入被静默忽略 | js/main.js:92-98 |
| 8 | 🟢 P3 低 | 文章卡片仅支持鼠标点击，无键盘可访问性 | js/main.js:46 |

---

## 🔴 1. `escapeHtml` 未定义，首页搜索必然崩溃（P0）

**位置**：`js/main.js:37`

```js
<h1 class="page-title">${keyword ? `“${escapeHtml(keyword)}” 的搜索结果` : "最新文章"}</h1>
```

`escapeHtml` 在整个项目中**没有任何定义**（已全局搜索确认）。用户在首页搜索框输入任意文字后：

1. 防抖结束 → 修改 `location.hash` 为 `#/?q=xxx`
2. 触发 `hashchange` → `render()` → `renderHome(keyword)`
3. 执行到 `escapeHtml(keyword)` 时抛出 `ReferenceError: escapeHtml is not defined`
4. **搜索结果页永远无法渲染出来**

【已验证】Node 复现：`ReferenceError - escapeHtml is not defined`

**修复建议**：在 `main.js` 顶部补上该函数：

```js
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
```

---

## 🟠 2. quickSort 固定取末位基准，有序输入导致栈溢出（P1）

**位置**：`js/sorting.js:23`

```js
const pivot = arr[arr.length - 1];
```

基准永远取最后一个元素。当输入已有序（或逆序）时，每次分区极度不平衡，递归深度达到 O(n)：

- 最坏时间复杂度退化为 **O(n²)**
- 递归深度 O(n)，大数组直接**爆栈**

【已验证】Node 复现：5 万个元素的有序数组 → `RangeError: Maximum call stack size exceeded`

**修复建议**：随机选取基准，或使用三数取中法：

```js
const pivot = arr[Math.floor(Math.random() * arr.length)];
```

（彻底消除爆栈需改用尾递归优化或显式栈的迭代版快排）

---

## 🟠 3. innerHTML 拼接未转义，存在注入隐患（P1）

**位置**：`js/main.js`

- `main.js:46` — `post.id` 直接拼进 `onclick` 属性：
  ```js
  <article class="post-card" onclick="location.hash='#/post/${post.id}'">
  ```
- `main.js:47,50,52` — `post.title`、`post.tags`、`post.excerpt` 未经转义直接进入 `innerHTML`

【已验证】若 `post.id` 含引号（如 `x' onclick='alert(1)//`），HTML 属性会被破坏，攻击者可注入任意属性/脚本。

**当前风险评级**：中低。因为 `POSTS` 目前是硬编码的可信数据，不会实际触发；但这是一个博客项目，未来一旦文章数据来源变为后端接口、Markdown 导入或允许读者输入，就会升级为真实 XSS 漏洞。

**修复建议**：

- 所有插值（除 `post.content` 外）统一过 `escapeHtml`（正好补上问题 1 缺失的函数）
- `onclick` 内联事件改为事件委托，`post.id` 放到 `data-id` 属性中：
  ```js
  <article class="post-card" data-id="${escapeHtml(post.id)}">
  // ...
  document.querySelector(".post-list").addEventListener("click", (e) => {
    const card = e.target.closest(".post-card");
    if (card) location.hash = "#/post/" + card.dataset.id;
  });
  ```

---

## 🟡 4. 搜索区分大小写（P2）

**位置**：`js/main.js:28-34`

```js
p.title.includes(keyword)
```

`String.includes` 区分大小写：搜索 `css` 无法命中标题中的 `CSS`（已验证）。中文不受影响，但英文关键词体验不一致。

**修复建议**：比较前统一转小写：

```js
const kw = keyword.toLowerCase();
posts.filter((p) =>
  !kw ||
  p.title.toLowerCase().includes(kw) ||
  p.excerpt.toLowerCase().includes(kw) ||
  p.tags.some((t) => t.toLowerCase().includes(kw))
);
```

---

## 🟡 5. sorting.js 声称"浏览器可运行"，实际浏览器下直接报错（P2）

**位置**：`js/sorting.js:1`（注释）、`js/sorting.js:51`（实现）

```js
// 三种排序算法实现（无框架依赖，node 或浏览器均可运行）  ← 注释
module.exports = { bubbleSort, quickSort, mergeSort };    ← 实现
```

`module` 在浏览器中未定义，若按注释将此文件以 `<script>` 引入页面，会在第 51 行抛出 `ReferenceError: module is not defined`。

**修复建议**（二选一）：

- 修改注释，明确仅支持 Node
- 做环境兼容：
  ```js
  if (typeof module !== "undefined") module.exports = { bubbleSort, quickSort, mergeSort };
  ```

---

## 🟢 6. 搜索框状态未按注释恢复（P3）

**位置**：`js/main.js:127-130`

```js
window.addEventListener("DOMContentLoaded", () => {
  // 从文章页刷新时恢复搜索框状态   ← 注释这么说
  render();                          ← 实际只调用了 render
});
```

带 `#/?q=css` 刷新页面时，列表按关键词过滤了，但**搜索框本身是空的**，用户不知道当前处于过滤状态。注释描述的功能并没有实现。

**修复建议**：

```js
function render() {
  // ...现有逻辑...
  if (path === "/") searchInput.value = keyword; // 同步搜索框显示
}
```

---

## 🟢 7. 文章详情页的搜索框输入被静默忽略（P3）

**位置**：`js/main.js:92-98`

```js
if (path === "/") {
  location.hash = q ? `#/?q=${encodeURIComponent(q)}` : "#/";
}
```

搜索框只在首页生效。在文章详情页（`#/post/xxx`）输入关键词**不会有任何反馈**（移动端该框已隐藏，但桌面端仍可见），容易让用户困惑。

**修复建议**：非首页时输入后跳回首页再执行搜索：

```js
location.hash = `#/?q=${encodeURIComponent(q)}`;
```

（`render()` 对 `#/?q=` 会走首页分支，天然支持跨页搜索）

---

## 🟢 8. 文章卡片无键盘可访问性（P3）

**位置**：`js/main.js:46`

`<article>` 用 `onclick` 跳转，但它是非交互元素：无法通过 Tab 聚焦、无法用回车打开、屏幕阅读器也不会把它当作可点击目标。

**修复建议**：卡片标题包一层 `<a href="#/post/${post.id}">`，或给 `article` 加 `tabindex="0"` + `keydown` 回车处理（推荐前者，原生语义免费获得全部行为）。

---

## 附：测试覆盖情况

`js/sorting.js` 内置自测覆盖了 6 类用例（常规、正序、逆序、单元素、空数组、重复值+负数）× 3 算法 = 18 项，全部通过。但存在盲区：

- **缺少大规模/有序输入用例** —— 恰好漏掉了能暴露问题 2（快排爆栈）的场景
- **缺少 NaN、非数值元素** 等异常输入验证
- 博客部分（路由、搜索、主题切换）**完全没有测试**

## 修复优先级建议

1. **立即修**：问题 1（搜索功能完全不可用，一行函数的事）
2. **合并 dev 前修**：问题 2、3（算法健壮性 + 安全隐患）
3. **择机修**：问题 4-8（体验与规范类）
