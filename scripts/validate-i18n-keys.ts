import fr from '../messages/fr.json';
import en from '../messages/en.json';
import {
  formatMissingKeysReport,
  validateReferencedI18nKeys,
} from '../lib/i18n/validate-referenced-keys';

const result = validateReferencedI18nKeys(fr, en);
const report = formatMissingKeysReport(result);

if (report) {
  console.error('i18n referenced-key validation failed:\n');
  console.error(report);
  process.exit(1);
}

console.info(
  `i18n referenced-key validation passed (${result.referencedKeys.length} keys checked).`,
);
