import fs from 'fs';
import path from 'path';

/**
 * Simple CSV reader for data-driven tests.
 * Expects the first row to be headers.
 */
export function readCsv<T extends Record<string, string>>(filePath: string): T[] {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {} as Record<string, string>;
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    rows.push(row as T);
  }

  return rows;
}
