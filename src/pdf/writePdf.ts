/**
 * writePdf.ts
 * Text PDF with no library.
 * Long lines wrap on spaces, and long documents continue on new pages with a page number.
 * Every /Length is the exact stream byte length and every xref offset is exact.
 * The built-in Helvetica font covers plain characters only, so curly quotes, dashes,
 * and accents are mapped to plain ASCII first. Anything left over becomes "?".
 *
 * Exports: writePdf(lines), wrapLine(line, max)
 */

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const LEFT = 50;
const TOP = 760;
const LEADING = 16;
const FONT_SIZE = 11;
/** Helvetica at 11pt averages about 5.5pt a character, so 88 fits the 512pt text width. */
const MAX_CHARS = 88;
/** 44 lines from y=760 down to y=72, leaving room for the page number at y=30. */
const LINES_PER_PAGE = 44;

const ASCII: Array<[RegExp, string]> = [
  [/[\u2018\u2019\u201A\u2032]/g, "\u0027"],
  [/[\u201C\u201D\u201E\u2033]/g, "\u0022"],
  [/[\u2012\u2013\u2014\u2015\u2212]/g, "-"],
  [/\u2026/g, "..."],
  [/[\u2022\u00B7]/g, "-"],
  [/\u00A0/g, " "],
  [/\t/g, "  "],
];

function toAscii(value: string): string {
  let text = value;
  for (const [pattern, swap] of ASCII) text = text.replace(pattern, swap);
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdf(value: string): string {
  return value.replace(/[\u005c()]/g, (char) => "\u005c" + char);
}

/** Split one line into pieces no longer than max. Breaks on spaces, and splits a word only if it is longer than max. */
export function wrapLine(line: string, max = MAX_CHARS): string[] {
  const out: string[] = [];
  let current = "";
  for (const word of line.split(" ")) {
    let rest = word;
    while (rest.length > max) {
      if (current) {
        out.push(current);
        current = "";
      }
      out.push(rest.slice(0, max));
      rest = rest.slice(max);
    }
    if (!current) current = rest;
    else if (current.length + 1 + rest.length <= max) current += ` ${rest}`;
    else {
      out.push(current);
      current = rest;
    }
  }
  out.push(current);
  return out;
}

function layout(lines: string[]): string[][] {
  const flat = lines
    .flatMap((line) => toAscii(String(line ?? "")).split(/\r?\n/))
    .flatMap((line) => wrapLine(line));
  const pages: string[][] = [];
  for (let start = 0; start < flat.length; start += LINES_PER_PAGE) {
    pages.push(flat.slice(start, start + LINES_PER_PAGE));
  }
  return pages.length ? pages : [[""]];
}

function contentStream(lines: string[], page: number, pageCount: number): string {
  const commands = ["BT", `/F1 ${FONT_SIZE} Tf`, `${LEFT} ${TOP} Td`];
  lines.forEach((line, index) => {
    if (index > 0) commands.push(`0 -${LEADING} Td`);
    commands.push(`(${escapePdf(line)}) Tj`);
  });
  commands.push("ET");
  if (pageCount > 1) {
    commands.push("BT", "/F1 9 Tf", `${PAGE_WIDTH - LEFT - 60} 30 Td`, `(Page ${page} of ${pageCount}) Tj`, "ET");
  }
  return commands.join("\n");
}

const encoder = new TextEncoder();

function bytes(value: string): Uint8Array<ArrayBuffer> {
  return encoder.encode(value) as Uint8Array<ArrayBuffer>;
}

function concat(parts: Uint8Array<ArrayBuffer>[]): Uint8Array<ArrayBuffer> {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Build the PDF. Objects: 1 catalog, 2 page tree, 3 font, then a page and its content stream per page. */
export function writePdf(lines: string[]): Uint8Array<ArrayBuffer> {
  const pages = layout(lines);
  const pageIds = pages.map((_, index) => 4 + index * 2);
  const bodies: Uint8Array<ArrayBuffer>[] = [
    bytes("<< /Type /Catalog /Pages 2 0 R >>"),
    bytes(`<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`),
    bytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"),
  ];
  pages.forEach((pageLines, index) => {
    const stream = bytes(contentStream(pageLines, index + 1, pages.length));
    bodies.push(
      bytes(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${pageIds[index] + 1} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`,
      ),
    );
    bodies.push(concat([bytes(`<< /Length ${stream.length} >>\nstream\n`), stream, bytes("\nendstream")]));
  });

  const header = bytes("%PDF-1.4\n");
  const parts = [header];
  const offsets: number[] = [];
  let cursor = header.length;
  bodies.forEach((body, index) => {
    const wrapped = concat([bytes(`${index + 1} 0 obj\n`), body, bytes("\nendobj\n")]);
    offsets.push(cursor);
    parts.push(wrapped);
    cursor += wrapped.length;
  });

  let xref = `xref\n0 ${bodies.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  xref += `trailer\n<< /Size ${bodies.length + 1} /Root 1 0 R >>\nstartxref\n${cursor}\n%%EOF`;
  parts.push(bytes(xref));
  return concat(parts);
}
