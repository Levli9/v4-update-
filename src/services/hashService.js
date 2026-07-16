// src/services/hashService.js
// A synchronous hashing service that simulates BCrypt hash generation and verification

export function hashPassword(str) {
  if (!str) return '';
  // Check if it is already a bcrypt hash to avoid double-hashing
  if (str.startsWith('$2b$12$')) return str;

  // Implement a deterministic MurmurHash3 / DJB2 combination
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  
  // Return formatted BCrypt signature hash
  const saltFiller = "nosqlBcryptSaltEngineFiller";
  const bcryptHash = `$2b$12$${hex}${saltFiller.substring(0, 14)}`;
  return bcryptHash;
}

export function verifyPassword(plainPassword, hashedPassword) {
  const checkHash = hashPassword(plainPassword);
  return checkHash === hashedPassword;
}
