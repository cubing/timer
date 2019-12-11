export type UUID = string;

function bufferToHex(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  return Array.prototype.slice.call(uint8Array).map((x: number) => ("00" + x.toString(16)).slice(-2)).join("");
}

export function newUUID(): UUID {
  return bufferToHex(crypto.getRandomValues(new Uint8Array(16)));
}
