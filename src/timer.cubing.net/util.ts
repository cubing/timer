export function removeClassesStartingWith(
  element: HTMLElement,
  prefix: string,
): void {
  var classes = Array.prototype.slice.call(element.classList);
  for (var i in classes) {
    var className = classes[i];
    if (className.startsWith(prefix)) {
      element.classList.remove(className);
    }
  }
}

export function nonsecureRandomChoice<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
