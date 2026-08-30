/**
 * Wovemark Motion & Animation Engine
 */

export class MotionEngine {
  private observer: IntersectionObserver | null = null;
  private isReducedMotion: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.isReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener("change", (e) => {
        this.isReducedMotion = e.matches;
      });

      this.setupObserver();
    }
  }

  private setupObserver() {
    if (typeof IntersectionObserver === "undefined") return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("wm-in-view");
            this.observer?.unobserve(target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
  }

  public attach(root: HTMLElement) {
    if (this.isReducedMotion || !this.observer) {
      // Reveal everything immediately if reduced motion
      const animatedElements = root.querySelectorAll(".wm-reveal, .wm-fade, [data-wm-motion]");
      animatedElements.forEach((el) => el.classList.add("wm-in-view"));
      return;
    }

    // Process staggered containers
    const staggerContainers = root.querySelectorAll("[data-wm-motion='stagger'], .wm-stagger");
    staggerContainers.forEach((container) => {
      const children = Array.from(container.children) as HTMLElement[];
      children.forEach((child, index) => {
        child.classList.add("wm-reveal");
        child.style.transitionDelay = `${index * 60}ms`;
        this.observer?.observe(child);
      });
    });

    // Observe standard reveal elements
    const revealElements = root.querySelectorAll(".wm-reveal, .wm-fade, [data-wm-motion='reveal']");
    revealElements.forEach((el) => {
      this.observer?.observe(el);
    });
  }

  public async transitionPage(callback: () => void | Promise<void>) {
    if (typeof document !== "undefined" && "startViewTransition" in document && !this.isReducedMotion) {
      // Use native View Transition API
      await (document as any).startViewTransition(async () => {
        await callback();
      }).finished;
    } else {
      await callback();
    }
  }
}

export const motionEngine = new MotionEngine();
