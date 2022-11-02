function materialIcon(path: string, altText: string): () => HTMLImageElement {
  return function () {
    const img = document.createElement("img");
    img.src = path;
    img.classList.add("material-icon");
    img.title = altText;
    return img;
  };
}

export const trashIcon = materialIcon(
  "/resources/vendor/material-icons/delete-24px-white.svg",
  "Delete",
);
export const playIcon = materialIcon(
  "/resources/vendor/material-icons/play_arrow-24px-white.svg",
  "Play",
);
