// Based on https://stackoverflow.com/a/18197341
export function downloadFile(fileName: string, content: string) {
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("download", fileName);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  downloadAnchor.setAttribute("href", URL.createObjectURL(blob));

  downloadAnchor.style.display = "none";
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}
