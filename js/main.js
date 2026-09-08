// ===== 极简 hash 路由 =====
const app = document.getElementById("app");

function render() {
  const hash = location.hash.slice(1) || "/";
  const [path, query] = hash.split("?");
  const keyword = query ? new URLSearchParams(query).get("q") || "" : "";

  updateNav(path);

  if (path === "/about") {
    renderAbout();
  } else if (path.startsWith("/post/")) {
    renderPostDetail(path.replace("/post/", ""));
  } else {
    renderHome(keyword);
  }
}

function updateNav(path) {
  document.querySelectorAll(".nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === "home" ? path === "/" || path.startsWith("/post") : path === "/about");
  });
}

// ===== 首页：文章列表 =====
function renderHome(keyword) {
  const posts = POSTS.filter(
    (p) =>
      !keyword ||
      p.title.includes(keyword) ||
      p.excerpt.includes(keyword) ||
      p.tags.some((t) => t.includes(keyword))
  );

  app.innerHTML = `
    <h1 class="page-title">${keyword ? `“${escapeHtml(keyword)}” 的搜索结果` : "最新文章"}</h1>
    <div class="post-list">
      ${posts.length ? posts.map(postCard).join("") : '<p class="empty-tip">没有找到相关文章</p>'}
    </div>
  `;
}

function postCard(post) {
  return `
    <article class="post-card" onclick="location.hash='#/post/${post.id}'">
      <h2>${post.title}</h2>
      <div class="post-meta">
        <span>${post.date}</span>
        <span>${post.tags.map((t) => `<span class="tag">${t}</span>`).join(" ")}</span>
      </div>
      <p class="post-excerpt">${post.excerpt}</p>
      <span class="read-more">阅读全文 →</span>
    </article>
  `;
}

// ===== 文章详情 =====
function renderPostDetail(id) {
  const post = POSTS.find((p) => p.id === id);
  if (!post) {
    app.innerHTML = '<p class="empty-tip">文章不存在 <a class="back-link" href="#/">返回首页</a></p>';
    return;
  }
  app.innerHTML = `
    <article class="post-detail">
      <a class="back-link" href="#/">← 返回列表</a>
      <h1>${post.title}</h1>
      <div class="post-meta">
        <span>${post.date}</span>
        <span>${post.tags.map((t) => `<span class="tag">${t}</span>`).join(" ")}</span>
      </div>
      <div class="post-content">${post.content}</div>
    </article>
  `;
}

// ===== 关于页 =====
function renderAbout() {
  app.innerHTML = `
    <div class="about-page">
      <h1>关于我</h1>
      <p>你好，欢迎来到我的技术博客！</p>
      <p>我是一名开发者，喜欢折腾前端技术，也关注工程化与效率工具。这个博客用来记录学习笔记、踩坑经验和生活随笔。</p>
      <p>如果文章对你有帮助，欢迎常来逛逛。</p>
    </div>
  `;
}

// ===== 搜索 =====
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", debounce(() => {
  const q = searchInput.value.trim();
  const [path] = (location.hash.slice(1) || "/").split("?");
  if (path === "/") {
    location.hash = q ? `#/?q=${encodeURIComponent(q)}` : "#/";
  }
}, 300));

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ===== 主题切换 =====
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark";
  const next = dark ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  themeToggle.textContent = dark ? "🌙" : "☀️";
});

// ===== 启动 =====
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  // 从文章页刷新时恢复搜索框状态
  render();
});
