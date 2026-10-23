// Minimal RFC 4180 parser: quoted fields, doubled quotes, newlines inside quotes.
// No dependency, so there is nothing extra to audit for a file we parse on every refresh.

export type CsvRecord = Record<string, string>;

export function parseCsv(input: string): CsvRecord[] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') inQuotes = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  if (!header) return [];
  const names = header.map((name) => name.trim());
  return body
    .filter((cells) => cells.some((cell) => cell.trim() !== ''))
    .map((cells) => Object.fromEntries(names.map((name, index) => [name, (cells[index] ?? '').trim()])));
}

// Published CSV carries the cell's *displayed* text, so numbers can arrive as "9,990".
export function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const cleaned = value.replace(/[,\s]/g, '');
  if (cleaned === '') return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function toBoolean(value: string | undefined): boolean {
  return value?.trim().toUpperCase() === 'TRUE';
}

export function toText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function toList(value: string | undefined, separator = '|'): string[] {
  return (value ?? '')
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}
