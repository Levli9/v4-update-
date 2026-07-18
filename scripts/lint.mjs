import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const serverFiles = [
  'server.js',
  'server/config.js',
  'server/brevoService.js',
  'server/passwordResetStore.js',
  'server/authStore.js',
  'server/learningStore.js',
  'server/courseStore.js',
  'server/aiValidation.js'
];
for (const file of serverFiles) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

const clientFiles = [
  'src/context/AppContext.jsx',
  'src/pages/Login.jsx',
  'src/pages/AdminApprovals.jsx',
  'src/pages/AIPresentationStudio.jsx',
  'src/services/presentationGenerator.js',
  'src/services/apiClient.js'
];
const forbiddenClientPatterns = [
  /api\.brevo\.com/i,
  /VITE_BREVO_API_KEY/,
  /shieldx_brevo_api_key/,
  /["']api-key["']\s*:/,
  /generativelanguage\.googleapis\.com/i,
  /VITE_GEMINI_API_KEY/,
  /plainPassword/
];

for (const file of clientFiles) {
  const source = readFileSync(file, 'utf8');
  for (const pattern of forbiddenClientPatterns) {
    if (pattern.test(source)) {
      throw new Error(`Forbidden client-side secret integration found in ${file}: ${pattern}`);
    }
  }
}

console.log(`Lint checks passed (${serverFiles.length} server files, ${clientFiles.length} security-sensitive client files).`);
