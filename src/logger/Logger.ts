import winston from 'winston';

// https://github.com/RaulinN/RaidFailTracker/blob/master/src/logger/Logger.ts
const logFormat = winston.format.printf(({level, message, timestamp, stack}) => {
    return `[${timestamp}] [${level}]\t${stack || message}`;
});

/** Custom Winston logger */
export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.errors({stack: true}),
        logFormat,
    ),
    transports: [new winston.transports.Console()],
});
