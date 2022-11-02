import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST, {
  // Ignore all URL parameters.
  ignoreURLParametersMatching: [/.*/],
});
