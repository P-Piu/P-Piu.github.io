(() => {
  const bindSidebarShadow = () => {
    document
      .querySelectorAll(".md-sidebar--secondary .md-sidebar__scrollwrap")
      .forEach((scrollArea) => {
        if (scrollArea.dataset.shadowBound === "true") return;

        const sidebar = scrollArea.closest(".md-sidebar--secondary");
        if (!sidebar) return;

        const updateShadow = () => {
          sidebar.classList.toggle("is-scrolled", scrollArea.scrollTop > 2);
        };

        scrollArea.dataset.shadowBound = "true";
        scrollArea.addEventListener("scroll", updateShadow, { passive: true });
        updateShadow();
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindSidebarShadow);
  } else {
    bindSidebarShadow();
  }
})();
