import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

test('client source contains no Brevo key or direct Brevo API integration', () => {
  const clientSource = walk('src')
    .filter((file) => /\.(?:js|jsx)$/.test(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  assert.doesNotMatch(clientSource, /xkeysib-/i);
  assert.doesNotMatch(clientSource, /VITE_BREVO_API_KEY/);
  assert.doesNotMatch(clientSource, /api\.brevo\.com/i);
  assert.doesNotMatch(clientSource, /shieldx_brevo_api_key/);
  assert.doesNotMatch(clientSource, /generativelanguage\.googleapis\.com/i);
  assert.doesNotMatch(clientSource, /VITE_GEMINI_API_KEY/);
  assert.doesNotMatch(clientSource, /Employee123!|Manager123!|plainPassword/);
});
