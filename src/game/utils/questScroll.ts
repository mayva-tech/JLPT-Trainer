/** Scroll the quest view to the top after Forward / step change. */
export function scrollQuestToTop(): void {
  const root = document.querySelector(".ppq-root");
  if (root instanceof HTMLElement) {
    root.scrollIntoView({ block: "start", behavior: "auto" });
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  // If a nested shell scrolls (some hosts wrap the app), reset that too.
  const shell = document.querySelector(".ppq-shell");
  if (shell instanceof HTMLElement && shell.scrollTop > 0) {
    shell.scrollTop = 0;
  }
}

/**
 * After picking an MCQ answer, scroll so the tip and the
 * Back / Try Again / Forward row sit at the bottom of the screen.
 */
export function scrollQuestFeedbackIntoView(): void {
  const run = () => {
    const nav = document.querySelector(".ppq-step-nav");
    if (nav instanceof HTMLElement) {
      // Prefer the footer buttons — keeps tip above and all three actions on screen.
      nav.scrollIntoView({
        block: "end",
        behavior: "smooth",
        inline: "nearest",
      });
      return;
    }
    const feedback = document.querySelector(".ppq-feedback");
    if (feedback instanceof HTMLElement) {
      feedback.scrollIntoView({
        block: "end",
        behavior: "smooth",
        inline: "nearest",
      });
      return;
    }
    // Last resort: pin the document bottom into view.
    const top = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    window.scrollTo({ top, left: 0, behavior: "smooth" });
  };
  // Double rAF: wait until React commits the revealed feedback + nav layout.
  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}
