(function () {
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0a0e14" : "#eef2f6";
  }

  // Prefer already-applied theme from head script to avoid flash
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current || saved || (prefersDark ? "dark" : "light"));

  if (toggle) {
    toggle.addEventListener("click", function () {
      const now = document.documentElement.getAttribute("data-theme");
      setTheme(now === "dark" ? "light" : "dark");
    });
  }

  const searchInput = document.getElementById("searchInput");
  const categoryBtns = document.querySelectorAll(".category-btn");
  const noteCards = document.querySelectorAll(".note-card");

  function filterNotes() {
    const query = (searchInput?.value || "").toLowerCase().trim();
    const activeCategory = document.querySelector(".category-btn.active");
    const category = activeCategory?.dataset.category || "all";
    const homePreview = category === "all" && !query;
    let visible = 0;

    noteCards.forEach(function (card) {
      const title = (card.dataset.title || "").toLowerCase();
      const excerpt = (card.dataset.excerpt || "").toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();
      const cardCategory = card.dataset.category || "";
      const recentOnly = card.dataset.recent === "0";

      const matchSearch = !query || title.includes(query) || excerpt.includes(query) || tags.includes(query);
      const matchCategory = category === "all" || cardCategory === category;
      const matchRecent = !homePreview || !recentOnly;
      const show = matchSearch && matchCategory && matchRecent;

      card.style.display = show ? "" : "none";
      if (show) visible += 1;
    });

    const empty = document.getElementById("filterEmpty");
    if (empty) empty.hidden = visible > 0;

    const viewAll = document.getElementById("viewAllNotes");
    if (viewAll) viewAll.style.display = homePreview ? "" : "none";
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterNotes);
  }

  categoryBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      categoryBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      filterNotes();
    });
  });

  document.querySelectorAll(".note-tags .tag").forEach(function (tag) {
    tag.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      const name = (tag.textContent || "").replace(/^#/, "").trim();
      if (searchInput) {
        searchInput.value = name;
        filterNotes();
        searchInput.focus();
      }
    });
  });

  filterNotes();
})();
