function getEnvVar(name, defaultValue) {
  const value = process.env[name] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is required but was not provided.`);
  }
  return value;
};

const NODE_ENV = getEnvVar('NODE_ENV', 'development');

const DATABASE_URL = process.env.DATABASE_URL;

const PORT = parseInt(getEnvVar('PORT', '3000'), 10);

const DB_HOST = getEnvVar('DB_HOST', 'localhost');
const DB_USER = getEnvVar('DB_USER', 'postgres');
const DB_PASSWORD = getEnvVar('DB_PASSWORD');
const DB_NAME = getEnvVar('DB_NAME');
const DB_PORT = parseInt(getEnvVar('DB_PORT', '5432'), 10);

module.exports = { NODE_ENV, DATABASE_URL, PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT };