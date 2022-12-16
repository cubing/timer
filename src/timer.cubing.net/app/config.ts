function save(identifier: string) {
	const element = document.getElementById(identifier) as HTMLInputElement;
	localStorage[identifier] = element.value;

	// Workaround for missing `Element.animate()` API in Safari.
	element.style.backgroundColor = "rgba(127, 255, 127)";
	setTimeout(() => {
		element.style.backgroundColor = "rgba(159, 255, 159)";
	}, 125);
	setTimeout(() => {
		element.style.backgroundColor = "rgba(192, 255, 192)";
	}, 250);
	setTimeout(() => {
		element.style.backgroundColor = "rgba(223, 255, 223)";
	}, 375);
	setTimeout(() => {
		element.style.backgroundColor = "inherit";
	}, 500);
}

function load(identifier: string) {
	(document.getElementById(identifier) as HTMLInputElement).value =
		localStorage[identifier] || "";
}

function setupField(identifier: string) {
	load(identifier);
	(document.getElementById(identifier) as HTMLInputElement).addEventListener(
		"change",
		save.bind(save, identifier),
	);
}

setupField("pouchDBUsername");
setupField("pouchDBPassword");
setupField("pouchDBDeviceName");

function saveCheckbox(identifier: string) {
	const elem = document.getElementById(identifier) as HTMLInputElement;
	console.log(elem.checked);
	localStorage[identifier] = elem.checked ? "true" : "false";
}

function setupCheckbox(identifier: string) {
	const elem = document.getElementById(identifier) as HTMLInputElement;
	elem.checked = localStorage[identifier] === "true";
	console.log(elem);
	elem.addEventListener("change", () => saveCheckbox(identifier));
}

setupCheckbox("hideScrambleDisplay");
setupCheckbox("preferHarmonicMean");

const clearServiceWorkersButton = document.querySelector(
	"#force-update-app",
) as HTMLButtonElement;
clearServiceWorkersButton.addEventListener("click", async () => {
	clearServiceWorkersButton.textContent += "...";
	const registrations = await navigator.serviceWorker.getRegistrations();
	registrations.map((registration) => registration.unregister());
	clearServiceWorkersButton.textContent += "done!";
	console.log("Cleared service worker!");
	const clearedFileCache = await caches.delete(
		`workbox-precache-v2-${location.origin}/`,
	);
	console.log("Cleared file cache:", clearedFileCache);
});
