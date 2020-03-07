import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

function save(identifier: string) {
  const element = document.querySelector(`#${identifier}`) as HTMLInputElement;
  localStorage[identifier] = element.value;

  // Workaround for missing `Element.animate()` API in Safari.
  element.style.backgroundColor = "rgba(127, 255, 127)";
  setTimeout(() => { element.style.backgroundColor = "rgba(159, 255, 159)"; }, 125);
  setTimeout(() => { element.style.backgroundColor = "rgba(192, 255, 192)"; }, 250);
  setTimeout(() => { element.style.backgroundColor = "rgba(223, 255, 223)"; }, 375);
  setTimeout(() => { element.style.backgroundColor = "inherit"; }, 500);
}

function load(identifier: string) {
  (document.querySelector(`#${identifier}`) as HTMLInputElement).value = localStorage[identifier] || "";
}

function setupField(identifier: string) {
  load(identifier);
  (document.querySelector(`#${identifier}`) as HTMLInputElement).addEventListener("change", save.bind(save, identifier));
}

setupField("pouchDBUsername");
setupField("pouchDBPassword");
setupField("pouchDBDeviceName");

const clearServiceWorkersButton = document.querySelector("#force-update-app") as HTMLButtonElement;
clearServiceWorkersButton.addEventListener("click", async () => {
  clearServiceWorkersButton.textContent += "..."
  const registrations = await navigator.serviceWorker.getRegistrations();
  registrations.map((registration) => registration.unregister())
  clearServiceWorkersButton.textContent += "done!"
  console.log("Cleared service worker!")
  const clearedFileCache = await caches.delete(`workbox-precache-v2-${location.origin}/`);
  console.log("Cleared file cache:", clearedFileCache);
});
