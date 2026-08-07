// Chrome (unlike Safari) can't decode HEIC/HEIF to render it in an <img> tag —
// iPhones save photos in this format by default, so this is common with real demo photos.
// The file itself is still fine to send to Gemini for extraction; this only affects the preview.
export function isHeicFile(file: File): boolean {
  return file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
}
