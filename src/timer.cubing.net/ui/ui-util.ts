export function removeClassesStartingWith(
  element: HTMLElement,
  prefix: string,
): void {
  const classes = Array.prototype.slice.call(element.classList);
  for (const i in classes) {
    const className = classes[i];
    if (className.startsWith(prefix)) {
      element.classList.remove(className);
    }
  }
}

export function nonsecureRandomChoice<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
