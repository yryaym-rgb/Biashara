import { describe, it, expect } from 'vitest';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';
import zh from '@/messages/zh.json';
import { validateReferencedI18nKeys } from '@/lib/i18n/validate-referenced-keys';

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

function collectKeys(obj: JsonObject, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value as JsonObject, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

describe('i18n message key parity', () => {
  it('fr.json, en.json, and zh.json have exactly the same key structure', () => {
    const frKeys = collectKeys(fr as JsonObject);
    const enKeys = collectKeys(en as JsonObject);
    const zhKeys = collectKeys(zh as JsonObject);

    const onlyInFr = frKeys.filter((k) => !enKeys.includes(k) || !zhKeys.includes(k));
    const onlyInEn = enKeys.filter((k) => !frKeys.includes(k) || !zhKeys.includes(k));
    const onlyInZh = zhKeys.filter((k) => !frKeys.includes(k) || !enKeys.includes(k));

    expect(onlyInFr, `Keys only in fr.json: ${onlyInFr.join(', ')}`).toEqual([]);
    expect(onlyInEn, `Keys only in en.json: ${onlyInEn.join(', ')}`).toEqual([]);
    expect(onlyInZh, `Keys only in zh.json: ${onlyInZh.join(', ')}`).toEqual([]);
    expect(frKeys).toEqual(enKeys);
    expect(frKeys).toEqual(zhKeys);
  });

  it('every referenced translation key exists in all locale files', () => {
    const result = validateReferencedI18nKeys(fr as JsonObject, en as JsonObject, zh as JsonObject);
    const missing = [...result.missingInFr, ...result.missingInEn, ...result.missingInZh];

    expect(
      missing,
      missing.map((entry) => `${entry.fullKey} (${entry.file}:${entry.line})`).join('\n'),
    ).toEqual([]);
  });
});
