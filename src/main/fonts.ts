import { promises as fs } from 'fs'
import * as path from 'path'

const fontExtensions = new Set([
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.fon',
  '.pfb',
  '.fnt',
])


export default async function listFontsRecursive(
  dir: string,
  visited: Set<string> = new Set()
): Promise<string[]> {
  try
  {
    const results: string[] = []

    const realDir = await fs.realpath(dir)
    if (visited.has(realDir)) return results // prevent infinite loop on cyclic symlinks
    visited.add(realDir)

    const entries = await fs.readdir(realDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(realDir, entry.name)

      try {
        const stat = await fs.lstat(fullPath)

        if (stat.isSymbolicLink()) {
          const target = await fs.realpath(fullPath)
          const targetStat = await fs.lstat(target)

          if (targetStat.isDirectory()) {
            const subResults = await listFontsRecursive(target, visited)
            results.push(...subResults)
          } else if (
            targetStat.isFile() &&
            fontExtensions.has(path.extname(entry.name).toLowerCase())
          ) {
            results.push(target)
          }
        } else if (stat.isDirectory()) {
          const subResults = await listFontsRecursive(fullPath, visited)
          results.push(...subResults)
        } else if (
          stat.isFile() &&
          fontExtensions.has(path.extname(entry.name).toLowerCase())
        ) {
          results.push(fullPath)
        }
      } catch (err) {
        console.warn(`Skipping ${fullPath}: ${(err as Error).message}`)
      }
    }

    return results
  } catch (e)
  {
    console.log("ERROR PARSING FONTS: " + e)
    return []
  }
}
