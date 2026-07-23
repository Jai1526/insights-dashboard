import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync } from 'fs';

const logDir = 'logs';

if (!existsSync(logDir)) {
  try { require('fs').mkdirSync(logDir, { recursive: true }); } catch {}
}

const isDev = process.env.NODE_ENV !== 'production';

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
  }),
  new DailyRotateFile({
    dirname: logDir,
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
  }),
];

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  transports,
});

export default logger;