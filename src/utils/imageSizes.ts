/**
 * Unsplash photos can be asked for at any size. Phones get a small copy
 * instead of downloading the 800-1200px one, which saves data and loads faster.
 * Other image hosts (photos uploaded by the owner) are returned unchanged.
 */
const SIZED = /([?&])w=(\d+)&h=(\d+)/

export function imageSrcSet(url: string, widths: number[]): string | undefined {
  if (!url.includes("images.unsplash.com")) return undefined
  const m = SIZED.exec(url)
  if (!m) return undefined
  const w = Number(m[2])
  const h = Number(m[3])
  const parts = widths
    .filter((x) => x < w)
    .map((x) => `${url.replace(SIZED, `$1w=${x}&h=${Math.round((x * h) / w)}`)} ${x}w`)
  parts.push(`${url} ${w}w`)
  return parts.join(", ")
}
