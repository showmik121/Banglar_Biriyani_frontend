import { describe, test, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? listFiles(full) : [full]
  })
}

describe("repository safety", () => {
  test(".gitignore keeps .env files and node_modules out of git", () => {
    const lines = fs
      .readFileSync(path.join(root, ".gitignore"), "utf-8")
      .split(/\r?\n/)
      .map((l) => l.trim())
    expect(lines).toContain(".env")
    expect(lines).toContain(".env.*")
    expect(lines).toContain("node_modules/")
  })

  test("no database credentials or server-only packages in browser code", () => {
    for (const file of listFiles(path.join(root, "src"))) {
      const text = fs.readFileSync(file, "utf-8")
      expect(text, file).not.toMatch(/DATABASE_URL|JWT_SECRET|@neondatabase|postgres(ql)?:\/\//)
    }
  })

  test("every image the site needs is in /public", () => {
    for (const name of ["logo.png", "logo-mark.png"]) {
      expect(fs.existsSync(path.join(root, "public", name)), name).toBe(true)
    }
  })
})
