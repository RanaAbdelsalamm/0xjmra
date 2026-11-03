const state = {
  posts: [],
  category: "all",
  openPost: null,
};

const feed = document.querySelector("[data-post-feed]");
const count = document.querySelector("[data-post-count]");
const filterButtons = [...document.querySelectorAll("[data-category]")];
const modal = document.querySelector("[data-summary-modal]");
const openSummaryButton = document.querySelector("[data-open-summary]");
const closeSummaryButton = document.querySelector("[data-close-summary]");
let lastFocusedElement = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseFrontMatter(markdown) {
  const normalized = markdown.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: normalized };
  }

  const data = {};
  match[1].split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return;
    const key = line.slice(0, separator).trim().toLowerCase();
    const rawValue = line.slice(separator + 1).trim();
    data[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });

  return { data, content: match[2].trim() };
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (date.getTime() === 0) return value || "undated";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

async function loadPosts() {
  const manifestResponse = await fetch("posts/index.json");
  if (!manifestResponse.ok) throw new Error("Unable to read the post manifest.");

  const manifest = await manifestResponse.json();
  const entries = Array.isArray(manifest) ? manifest : manifest.posts;
  if (!Array.isArray(entries)) throw new Error("The post manifest is not valid.");

  const posts = await Promise.all(
    entries.map(async (entry) => {
      const path = typeof entry === "string" ? entry : entry.path;
      const response = await fetch(`posts/${path}`);
      if (!response.ok) throw new Error(`Unable to load ${path}.`);
      const markdown = await response.text();
      const parsed = parseFrontMatter(markdown);
      return {
        path,
        title: parsed.data.title || "Untitled post",
        date: parsed.data.date || "",
        category: parsed.data.category || "Systems",
        excerpt: parsed.data.excerpt || "",
        content: parsed.content,
      };
    }),
  );

  return posts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
}

function renderPosts() {
  const visiblePosts = state.posts.filter((post) => {
    return state.category === "all" || post.category.toLowerCase() === state.category.toLowerCase();
  });

  count.textContent = `${visiblePosts.length} ${visiblePosts.length === 1 ? "entry" : "entries"}`;

  if (!visiblePosts.length) {
    feed.innerHTML = '<div class="empty-state">No notes filed under this category yet.</div>';
    return;
  }

  feed.innerHTML = visiblePosts
    .map((post, index) => {
      const postId = `${post.path}-${index}`.replace(/[^a-z0-9_-]/gi, "-");
      const isOpen = state.openPost === post.path;
      return `
        <article class="post-card${isOpen ? " is-open" : ""}" data-post-card="${escapeHtml(post.path)}">
          <div class="post-card-header">
            <button class="post-toggle" type="button" data-post-toggle="${escapeHtml(post.path)}" aria-expanded="${isOpen}" aria-controls="${postId}-content">
              <h2 class="post-title">${escapeHtml(post.title)}</h2>
              <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
              <div class="post-meta" aria-label="Post metadata">
                <span>${escapeHtml(formatDate(post.date))}</span>
                <span>${escapeHtml(post.category)}</span>
              </div>
            </button>
          </div>
          <div class="post-expand" id="${postId}-content">
            <div class="post-expand-inner">
              <div class="post-content">${window.marked ? window.marked.parse(post.content) : escapeHtml(post.content)}</div>
            </div>
          </div>
        </article>`;
    })
    .join("");
}

function setCategory(category) {
  state.category = category;
  state.openPost = null;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.category.toLowerCase() === category.toLowerCase();
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderPosts();
}

function togglePost(path) {
  state.openPost = state.openPost === path ? null : path;
  renderPosts();
}

function openModal() {
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  closeSummaryButton.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});

feed.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-post-toggle]");
  if (toggle) togglePost(toggle.dataset.postToggle);
});

openSummaryButton.addEventListener("click", openModal);
closeSummaryButton.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

loadPosts()
  .then((posts) => {
    state.posts = posts;
    renderPosts();
  })
  .catch((error) => {
    console.error(error);
    count.textContent = "offline";
    feed.innerHTML = '<div class="error-state">The notebook could not be loaded right now. Check that posts/index.json and the Markdown files are published together.</div>';
  });
