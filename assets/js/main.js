(function () {
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (toggle) toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
  }

  setTheme(saved || (prefersDark ? "dark" : "light"));

  if (toggle) {
    toggle.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  const searchInput = document.getElementById("searchInput");
  const categoryBtns = document.querySelectorAll(".category-btn");
  const noteCards = document.querySelectorAll(".note-card");

  function filterNotes() {
    const query = (searchInput?.value || "").toLowerCase().trim();
    const activeCategory = document.querySelector(".category-btn.active");
    const category = activeCategory?.dataset.category || "all";

    noteCards.forEach(function (card) {
      const title = (card.dataset.title || "").toLowerCase();
      const excerpt = (card.dataset.excerpt || "").toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();
      const cardCategory = card.dataset.category || "";

      const matchSearch = !query || title.includes(query) || excerpt.includes(query) || tags.includes(query);
      const matchCategory = category === "all" || cardCategory === category;

      card.style.display = matchSearch && matchCategory ? "" : "none";
    });
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
})();
