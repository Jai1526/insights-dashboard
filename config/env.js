import dotenv from 'dotenv';
import path from 'path';

export function loadEnvironment(baseDir = process.cwd()) {
  const envPath = path.resolve(baseDir, '.env');
  dotenv.config({ path: envPath });

  // Validate required environment variables
  const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
  const missingEnv = requiredEnv.filter((env) => !process.env[env]);

  if (missingEnv.length > 0) {
    throw new Error(
      `FATAL CONFIG ERROR: Missing required environment variables: ${missingEnv.join(', ')}`
    );
  }

  // Set defaults
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || '5000';

  return process.env;
}


