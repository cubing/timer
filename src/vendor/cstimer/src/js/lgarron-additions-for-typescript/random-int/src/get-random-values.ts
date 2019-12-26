import * as nodeCrypto from "crypto"

function nodeGetRandomValues(arr: Uint32Array): void {
  if (! (arr instanceof Uint32Array)) {
    throw new Error("The getRandomValues() shim only takes unsigned 32-bit int arrays");
  }
  var bytes = nodeCrypto.randomBytes(arr.length * 4);
  var uint32_list = [];
  for (var i = 0; i < arr.length; i++) {
    uint32_list.push(
      (bytes[i*4+0] << 24) +
      (bytes[i*4+1] << 16) +
      (bytes[i*4+2] <<  8) +
      (bytes[i*4+3] <<  0)
    );
  }
  arr.set(uint32_list);
}

function browserGetRandomValues(arr: Uint32Array): void {
  crypto.getRandomValues(arr);
}

const inBrowser = typeof crypto !== "undefined" && typeof crypto.getRandomValues !== "undefined";
export const getRandomValues = inBrowser ? browserGetRandomValues : nodeGetRandomValues
