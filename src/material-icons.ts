import delete_white_svg from "url:./vendor/material-icons/delete-24px-white.svg";
import play_white_svg from "url:./vendor/material-icons/play_arrow-24px-white.svg";

function materialIcon(path: string, altText: string): () => HTMLImageElement {
  return function () {
    const img = document.createElement("img");
    img.src = path;
    img.classList.add("material-icon");
    img.title = altText;
    return img;
  };
}

export const trashIcon = materialIcon(delete_white_svg, "Delete");
export const playIcon = materialIcon(play_white_svg, "Play");
