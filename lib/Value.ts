export type Value = number;

export function parseValue(text: string): Value {
  return parseFloat(text);
}

export function formatValue(value: Value): string {
  return String(value);
}
