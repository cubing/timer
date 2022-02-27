export class TextFitter {
  constructor(private elem: HTMLElement, private options?: {verticalRatio?: number}) {
    console.log(this.elem);
    const observer = new ResizeObserver(() => this.onResize());
    observer.observe(this.elem);
    this.elem.style.overflow = "hidden"
  }

  onResize(): void {
    this.elem.classList.toggle(
      "vertical",
      this.elem.offsetWidth / this.elem.offsetHeight < (this.options?.verticalRatio ?? 1)
    );

    let px = 1;
    for (px = 1; px < 1000 && this.tryFit(px); px *= 2) {}
    // console.log("1", px);
    // debugger;
    for (
      px = this.lastGoodFit;
      px < 1000 && this.tryFit(px);
      px = Math.ceil(1.1 * px)
    ) {}
    console.log("2", px);
    // for (; px < 1000 && this.tryFit(px); px = Math.ceil(1.1 * px)) {}

    this.tryFit(this.lastGoodFit);
  }

  lastGoodFit: number = 1;
  tryFit(px: number): boolean {
    console.log("trying", px);
    this.elem.style.fontSize = `${px}vw`;
    if (this.elem.offsetWidth < this.elem.scrollWidth) {
      console.log(
        "Width too large!",
        px,
        this.elem.offsetWidth,
        this.elem.scrollWidth
      );
      return false;
    }
    if (this.elem.offsetHeight < this.elem.scrollHeight) {
      console.log(
        "Height too large!",
        px,
        this.elem.offsetHeight,
        this.elem.scrollHeight
      );
      return false;
    }
    // console.log(this.elem.offsetWidth, this.elem.scrollWidth);
    this.lastGoodFit = px;
    return true;
  }
}
