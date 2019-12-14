
// Based on https://stackoverflow.com/a/18197341
export function downloadFile(fileName: string, content: string) {
  var downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute('download', fileName);
  downloadAnchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));

  downloadAnchor.style.display = "none";
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}
