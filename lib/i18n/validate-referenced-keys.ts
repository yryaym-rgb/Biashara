import fs from 'node:fs';
import path from 'node:path';
import { MINING_EVENT_CATEGORIES } from '@/lib/constants/mining-events';
import {
  NAMESPACE_TEMPLATE_EXPANSIONS,
  TEMPLATE_KEY_EXPANSIONS,
} from '@/lib/i18n/i18n-key-expansions';

type JsonObject = Record<string, unknown>;

export interface ReferencedKey {
  fullKey: string;
  file: string;
  line: number;
}

export interface ValidationResult {
  missingInFr: ReferencedKey[];
  missingInEn: ReferencedKey[];
  missingInZh: ReferencedKey[];
  referencedKeys: ReferencedKey[];
}

const SOURCE_ROOTS = ['app', 'components', 'lib', 'actions'] as const;
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);

const TRANSLATOR_DECLARATION =
  /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:'([^']+)'|"([^"]+)"|\{[^}]*\bnamespace:\s*'([^']+)')/g;

const TRANSLATOR_CALL = /\b(t\w*)\(\s*(?:'([^']+)'|"([^"]+)"|`((?:[^`$]|\$\{[^}]+\})*)`)/g;

function collectSourceFiles(rootDir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      const extension = path.extname(entry.name);
      if (!SOURCE_EXTENSIONS.has(extension)) {
        continue;
      }

      if (
        absolutePath.includes(`${path.sep}lib${path.sep}i18n${path.sep}validate-referenced-keys.ts`) ||
        absolutePath.includes(`${path.sep}lib${path.sep}i18n${path.sep}i18n-key-expansions.ts`)
      ) {
        continue;
      }

      files.push(absolutePath);
    }
  }

  for (const sourceRoot of SOURCE_ROOTS) {
    const absoluteRoot = path.join(rootDir, sourceRoot);
    if (fs.existsSync(absoluteRoot)) {
      walk(absoluteRoot);
    }
  }

  return files.sort();
}

function hasMessageKey(messages: JsonObject, fullKey: string): boolean {
  const parts = fullKey.split('.');
  let current: unknown = messages;

  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = (current as JsonObject)[part];
  }

  return typeof current === 'string';
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function expandTemplateKey(namespace: string, templateBody: string): string[] {
  if (!templateBody.includes('${')) {
    return [templateBody];
  }

  const interpolationMatch = templateBody.match(/^([^`$]*)\$\{[^}]+\}(.*)$/);
  if (!interpolationMatch) {
    return [];
  }

  const prefix = interpolationMatch[1] ?? '';
  const suffix = interpolationMatch[2] ?? '';
  if (suffix !== '') {
    return [];
  }

  const namespaceExpansions = NAMESPACE_TEMPLATE_EXPANSIONS[namespace]?.[prefix];
  if (namespaceExpansions) {
    return [...namespaceExpansions];
  }

  const globalExpansions = TEMPLATE_KEY_EXPANSIONS[prefix];
  if (globalExpansions) {
    return [...globalExpansions];
  }

  return [];
}

interface NamespaceDeclaration {
  variableName: string;
  namespace: string;
  line: number;
}

function parseNamespaceDeclarations(source: string): NamespaceDeclaration[] {
  const declarations: NamespaceDeclaration[] = [];

  for (const match of source.matchAll(TRANSLATOR_DECLARATION)) {
    const variableName = match[1];
    const namespace = match[2] ?? match[3] ?? match[4];
    if (variableName && namespace) {
      declarations.push({
        variableName,
        namespace,
        line: lineNumberAt(source, match.index ?? 0),
      });
    }
  }

  return declarations;
}

function resolveNamespace(
  declarations: NamespaceDeclaration[],
  variableName: string,
  line: number,
): string | undefined {
  let resolved: string | undefined;

  for (const declaration of declarations) {
    if (declaration.variableName !== variableName || declaration.line > line) {
      continue;
    }
    resolved = declaration.namespace;
  }

  return resolved;
}

function parseReferencedKeys(filePath: string, source: string): ReferencedKey[] {
  const declarations = parseNamespaceDeclarations(source);
  const referenced: ReferencedKey[] = [];
  const rootDir = process.cwd();

  for (const match of source.matchAll(TRANSLATOR_CALL)) {
    const variableName = match[1];
    const staticKey = match[2] ?? match[3];
    const backtickKey = match[4];

    if (!variableName) {
      continue;
    }

    const line = lineNumberAt(source, match.index ?? 0);
    const namespace = resolveNamespace(declarations, variableName, line);
    if (!namespace) {
      continue;
    }

    const relativeFile = path.relative(rootDir, filePath);

    if (staticKey) {
      referenced.push({
        fullKey: `${namespace}.${staticKey}`,
        file: relativeFile,
        line,
      });
      continue;
    }

    if (backtickKey) {
      const expandedKeys = expandTemplateKey(namespace, backtickKey);
      for (const relativeKey of expandedKeys) {
        referenced.push({
          fullKey: `${namespace}.${relativeKey}`,
          file: relativeFile,
          line,
        });
      }
    }
  }

  for (const match of source.matchAll(/\btMinerals\(\s*'([^']+)'\)/g)) {
    const mineralId = match[1];
    if (!mineralId) {
      continue;
    }
    referenced.push({
      fullKey: `minerals.${mineralId}`,
      file: path.relative(rootDir, filePath),
      line: lineNumberAt(source, match.index ?? 0),
    });
  }

  for (const match of source.matchAll(/\btUnits\(\s*'([^']+)'\)/g)) {
    const unit = match[1];
    if (!unit) {
      continue;
    }
    referenced.push({
      fullKey: `units.${unit}`,
      file: path.relative(rootDir, filePath),
      line: lineNumberAt(source, match.index ?? 0),
    });
  }

  for (const match of source.matchAll(/\btCategories\(\s*(\w+)\)/g)) {
    const line = lineNumberAt(source, match.index ?? 0);
    const namespace = resolveNamespace(declarations, 'tCategories', line);
    if (!namespace) {
      continue;
    }

    for (const category of MINING_EVENT_CATEGORIES) {
      referenced.push({
        fullKey: `${namespace}.${category}`,
        file: path.relative(rootDir, filePath),
        line,
      });
    }
  }

  return referenced;
}

function dedupeReferencedKeys(keys: ReferencedKey[]): ReferencedKey[] {
  const seen = new Set<string>();
  const deduped: ReferencedKey[] = [];

  for (const entry of keys) {
    if (seen.has(entry.fullKey)) {
      continue;
    }
    seen.add(entry.fullKey);
    deduped.push(entry);
  }

  return deduped.sort((a, b) => a.fullKey.localeCompare(b.fullKey));
}

export function validateReferencedI18nKeys(
  frMessages: JsonObject,
  enMessages: JsonObject,
  zhMessages: JsonObject,
  rootDir = process.cwd(),
): ValidationResult {
  const referencedKeys = dedupeReferencedKeys(
    collectSourceFiles(rootDir).flatMap((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      return parseReferencedKeys(filePath, source);
    }),
  );

  const missingInFr = referencedKeys.filter((entry) => !hasMessageKey(frMessages, entry.fullKey));
  const missingInEn = referencedKeys.filter((entry) => !hasMessageKey(enMessages, entry.fullKey));
  const missingInZh = referencedKeys.filter((entry) => !hasMessageKey(zhMessages, entry.fullKey));

  return {
    missingInFr,
    missingInEn,
    missingInZh,
    referencedKeys,
  };
}

export function formatMissingKeysReport(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.missingInFr.length > 0) {
    lines.push('Missing in fr.json:');
    for (const entry of result.missingInFr) {
      lines.push(`  - ${entry.fullKey} (${entry.file}:${entry.line})`);
    }
  }

  if (result.missingInEn.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('Missing in en.json:');
    for (const entry of result.missingInEn) {
      lines.push(`  - ${entry.fullKey} (${entry.file}:${entry.line})`);
    }
  }

  if (result.missingInZh.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('Missing in zh.json:');
    for (const entry of result.missingInZh) {
      lines.push(`  - ${entry.fullKey} (${entry.file}:${entry.line})`);
    }
  }

  return lines.join('\n');
}
