/**
 * writePdf.ts
 * One-page text PDF. Length is the exact stream byte length.
 */

function escapePdf(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function writePdf(lines: string[]): Uint8Array {
  const commands = ["BT", "/F1 11 Tf", "50 760 Td"];
  lines.slice(0, 40).forEach((line, index) => {
    if (index > 0) commands.push("0 -16 Td");
    commands.push(`(${escapePdf(line)}) Tj`);
  });
  commands.push("ET");
  const stream = new TextEncoder().encode(commands.join("\n"));
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ].map((object) => new TextEncoder().encode(object));
  const encoded = new TextEncoder();
  const before = encoded.encode("%PDF-1.4\n");
  const endStream = encoded.encode("\nendstream\nendobj\n");
  const objWrap = (index: number, body: Uint8Array) =>
    concat([encoded.encode(`${index} 0 obj\n`), body, encoded.encode("\nendobj\n")]);
  const parts = [before];
  const offsets = [0];
  let cursor = before.length;
  objects.forEach((object, index) => {
    offsets.push(cursor);
    if (index === 3) {
      const wrapped = concat([encoded.encode("4 0 obj\n"), object, stream, endStream]);
      parts.push(wrapped);
      cursor += wrapped.length;
      return;
    }
    const wrapped = objWrap(index + 1, object);
    parts.push(wrapped);
    cursor += wrapped.length;
  });
  const xrefAt = cursor;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  parts.push(encoded.encode(xref));
  return concat(parts);
}
