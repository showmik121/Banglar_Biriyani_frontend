/** Shrinks a photo chosen on the owner's device so it is small enough to upload (about 170 KB at most). */
const MAX_CHARS = 240_000 // the server accepts up to 245,000 characters of data URL

export async function shrinkPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo")
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error("This photo could not be read. Try another one.")
  try {
    for (const [side, quality] of [
      [1000, 0.82],
      [900, 0.72],
      [760, 0.65],
      [640, 0.55],
      [480, 0.5],
    ] as const) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const ctx = canvas.getContext("2d")
      if (!ctx) break
      ctx.fillStyle = "#fff" // transparent PNGs become white, not black
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const url = canvas.toDataURL("image/jpeg", quality)
      if (url.length <= MAX_CHARS) return url
    }
  } finally {
    bitmap.close?.()
  }
  throw new Error("This photo is too big to shrink. Try another one.")
}
