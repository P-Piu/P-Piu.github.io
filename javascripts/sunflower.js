(() => {
  const mountSunflower = () => {
    const widget = document.querySelector("[data-sunflower-widget]");
    const button = widget?.querySelector(".sunflower-button");
    if (!widget || !button || widget.dataset.bound === "true") return;

    let resetTimer;
    widget.dataset.bound = "true";
    button.addEventListener("click", () => {
      window.clearTimeout(resetTimer);
      widget.classList.remove("is-tapped");
      void widget.offsetWidth;
      widget.classList.add("is-tapped");
      resetTimer = window.setTimeout(() => {
        widget.classList.remove("is-tapped");
      }, 620);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSunflower);
  } else {
    mountSunflower();
  }
})();
