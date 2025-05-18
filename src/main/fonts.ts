import { promises as fs } from 'fs'
import fontkit from 'fontkit'
import * as path from 'path'
import os from 'os'

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
  try {
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
  } catch (e) {
    console.log('ERROR PARSING FONTS: ' + e)
    return []
  }
}

function checkUnicodeRangeSupport(font: fontkit.Font, range: [number, number]): boolean {
  for (let codepoint = range[0]; codepoint <= range[1]; codepoint++) {
    const glyph = font.glyphForCodePoint(codepoint)
    if (glyph && glyph.id !== 0) {
      return true // glyph found in the range
    }
  }
  return false
}

function getFontWeightStyle(subfamily): object {
  const weightMap = {
    'Thin': 100,
    'Extra Light': 200,
    'Light': 300,
    'Regular': 400,
    'Medium': 500,
    'Semi Bold': 600,
    'Bold': 700,
    'Extra Bold': 800,
    'Black': 900
  };

  const weight = weightMap[subfamily] || 400;
  const style = subfamily.includes('Italic') || subfamily.includes('Oblique') ? 'italic' : 'normal';

  return { weight, style };
}

export async function getFontInfo(fontPath: string): Promise<object | null> {
  try {
    const font = await fontkit.open(fontPath)

    const supportsCyrillic = checkUnicodeRangeSupport(font, [0x0400, 0x04FF])
    const supportsJapanese =
      checkUnicodeRangeSupport(font, [0x3040, 0x309F]) || // Hiragana
      checkUnicodeRangeSupport(font, [0x30A0, 0x30FF]) || // Katakana
      checkUnicodeRangeSupport(font, [0x4E00, 0x9FFF])   // CJK Unified Ideographs (Kanji)

    const supportsKorean = checkUnicodeRangeSupport(font, [0xAC00, 0xD7AF]) // Hangul Syllables

    const supportsChinese = checkUnicodeRangeSupport(font, [0x4E00, 0x9FFF]) // CJK Unified Ideographs

    return {
      fontNames: {
        family: font.familyName,
        subfamily: font.subfamilyName,
        postscript: font.postscriptName,
        fullname: font.fullName,
        version: font.version
      },
      variations: font.namedVariations,
      style: getFontWeightStyle(font.subfamilyName),
      path: fontPath,
      supportsCyrillic,
      supportsJapanese,
      supportsKorean,
      supportsChinese
    }
  } catch (error) {
    console.warn(`Failed to open font ${fontPath}: ${(error as Error).message}`)
    return null
  }
}
