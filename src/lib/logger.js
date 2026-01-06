/**
 * Simple logger with color support
 */

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  SUCCESS: 2,
  WARN: 3,
  ERROR: 4,
};

class Logger {
  constructor(level = LEVELS.INFO) {
    this.level = level;
  }

  log(message, color = COLORS.reset) {
    console.log(`${color}${message}${COLORS.reset}`);
  }

  debug(message) {
    if (this.level <= LEVELS.DEBUG) {
      this.log(`[DEBUG] ${message}`, COLORS.gray);
    }
  }

  info(message) {
    if (this.level <= LEVELS.INFO) {
      this.log(`${message}`, COLORS.cyan);
    }
  }

  success(message) {
    if (this.level <= LEVELS.SUCCESS) {
      this.log(message, COLORS.green);
    }
  }

  warn(message) {
    if (this.level <= LEVELS.WARN) {
      this.log(`⚠️  ${message}`, COLORS.yellow);
    }
  }

  error(message) {
    if (this.level <= LEVELS.ERROR) {
      this.log(`❌ ${message}`, COLORS.red);
    }
  }

  section(title) {
    this.log(`\n${"=".repeat(50)}`, COLORS.bright + COLORS.magenta);
    this.log(title, COLORS.bright + COLORS.magenta);
    this.log("=".repeat(50) + "\n", COLORS.bright + COLORS.magenta);
  }

  table(data) {
    console.table(data);
  }
}

export const logger = new Logger(LEVELS.INFO);
