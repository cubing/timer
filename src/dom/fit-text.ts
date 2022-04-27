// TODO: How do we avoid bad sizing flashes without this?
const globalWait = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

export class TextFitter {
  constructor(
    private elem: HTMLElement,
    private options?: { verticalRatio?: number }
  ) {
    console.log({ elem });
    const observer = new ResizeObserver(() => this.onResize());
    observer.observe(this.elem);
    this.elem.style.overflow = "hidden";
    this.elem.style.contain = "strict";
  }

  lastDims: { clientWidth: number; clientHeight: number } | null = null;
  async onResize(contentChanged: boolean = false): Promise<void> {
    const { clientWidth, clientHeight } = this.elem;
    if (
      !contentChanged &&
      this.lastDims &&
      this.lastDims.clientWidth === clientWidth &&
      this.lastDims.clientHeight === clientHeight
    ) {
      // No change. Let's avoid debouncing / redundant DOM sizing operations.
      return;
    }
    this.lastDims = { clientWidth, clientHeight };

    // await globalWait();
    this.elem.classList.toggle(
      "vertical",
      this.elem.clientWidth / this.elem.clientHeight <
        (this.options?.verticalRatio ?? 1)
    );

    let px = 1;
    for (px = 1; px < 1000 && this.tryFit(px); px *= 2) {}
    for (
      px = this.lastGoodFit;
      px < 1000 && this.tryFit(px);
      px = Math.ceil(1.1 * px)
    ) {}

    this.tryFit(this.lastGoodFit);
  }

  lastGoodFit: number = 1;
  tryFit(px: number): boolean {
    this.elem.style.fontSize = `${px}px`; // TODO: back to `em`?
    if (this.elem.clientWidth < this.elem.scrollWidth) {
      return false;
    }
    if (this.elem.clientHeight < this.elem.scrollHeight) {
      return false;
    }
    this.lastGoodFit = px;
    return true;
  }
}
