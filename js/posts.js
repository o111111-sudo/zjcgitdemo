// 文章数据：新增文章在这里添加即可
const POSTS = [
  {
    id: "hello-blog",
    title: "我的第一篇博客文章",
    date: "2026-09-08",
    tags: ["随笔"],
    excerpt: "为什么要写博客，以及如何用最朴素的技术搭建一个属于自己的小天地。",
    content: `
<p>欢迎来到我的技术博客！这是第一篇文章。</p>
<h2>为什么要写博客</h2>
<p>写作是最好的思考方式。把学到的东西整理成文字，不仅能加深理解，还能帮助遇到同样问题的人。</p>
<h2>这个博客怎么搭建的</h2>
<p>没有用任何框架，就是最基础的 HTML5 + CSS + JavaScript：</p>
<ul>
  <li>原生 <code>hash 路由</code> 实现页面切换</li>
  <li>文章数据用 JS 对象数组管理</li>
  <li>CSS 变量实现明暗主题切换</li>
</ul>
<p>简单，但完全够用。</p>
<pre><code>const POSTS = [
  { id: "hello-blog", title: "我的第一篇博客文章", ... }
];</code></pre>
`
  },
  {
    id: "css-variables",
    title: "CSS 变量与暗色模式实践",
    date: "2026-09-01",
    tags: ["CSS", "前端"],
    excerpt: "用 CSS 自定义属性实现主题切换，几十行代码就能让网站支持暗色模式。",
    content: `
<p>暗色模式已经成为现代网站的标配，而 CSS 变量让它的实现变得非常简单。</p>
<h2>定义变量</h2>
<pre><code>:root {
  --bg: #f8f9fa;
  --text: #212529;
}

[data-theme="dark"] {
  --bg: #121212;
  --text: #e9ecef;
}</code></pre>
<h2>切换主题</h2>
<pre><code>document.documentElement.dataset.theme = 'dark';</code></pre>
<p>只要组件样式都引用这些变量，切换主题就是一瞬间的事。</p>
<h2>小技巧</h2>
<ul>
  <li>把用户主题偏好存到 <code>localStorage</code>，刷新后依然生效</li>
  <li>配合 <code>transition</code> 让颜色过渡更自然</li>
</ul>
`
  },
  {
    id: "hash-router",
    title: "手写一个极简前端路由",
    date: "2026-08-20",
    tags: ["JavaScript", "前端"],
    excerpt: "不借助任何库，用 hashchange 事件实现单页应用的路由切换。",
    content: `
<p>单页应用的核心之一是前端路由。其实用原生 JS 实现一个极简版只需要几行代码。</p>
<h2>监听 hash 变化</h2>
<pre><code>window.addEventListener('hashchange', render);

function render() {
  const hash = location.hash.slice(1) || '/';
  // 根据 hash 决定渲染哪个页面
}</code></pre>
<h2>原理</h2>
<ol>
  <li><code>#/</code> 后面的部分变化不会触发页面刷新</li>
  <li>监听 <code>hashchange</code> 事件</li>
  <li>解析 hash，渲染对应内容</li>
</ol>
<p>对于个人博客这种规模的项目，完全没必要引入 Vue Router 或 React Router。</p>
`
  },
  {
    id: "learning-notes",
    title: "关于学习习惯的一些思考",
    date: "2026-08-05",
    tags: ["随笔", "方法论"],
    excerpt: "输入和输出要形成闭环，学了不用等于没学。聊聊我的一些学习习惯。",
    content: `
<p>最近在反思自己的学习方式，记录一些想法。</p>
<h2>输出倒逼输入</h2>
<p>只看不写，知识留不住。给自己定个小目标：每学一个新东西，写一篇短文总结。</p>
<h2>费曼技巧</h2>
<p>试着把概念讲给完全不懂的人听。讲不清楚的地方，就是你没理解的地方。</p>
<h2>留白也很重要</h2>
<p>不要把时间排满。大脑需要休息来消化和关联知识。</p>
`
  }
];
