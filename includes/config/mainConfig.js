function getEnvVar(name, defaultValue) {
  const value = process.env[name] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is required but was not provided.`);
  }
  return value;
}

const PORT = parseInt(getEnvVar('PORT', '3000'), 10);

module.exports = { PORT };