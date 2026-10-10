import LZString from "lz-string";

export function compressToHash(data) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

export function decompressFromHash(hash) {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(hash);
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (err) {
    console.error("Failed to parse URL hash state:", err);
    return null;
  }
}
