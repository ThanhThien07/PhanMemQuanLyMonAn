/**
 * Hệ thống Logger chuẩn hóa với màu sắc và timestamp
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export const logger = {
  info: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.cyan}ℹ️ [INFO]${colors.reset}: ${msg}`, ...args);
  },
  success: (msg, ...args) => {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.green}✅ [SUCCESS]${colors.reset}: ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.yellow}⚠️ [WARN]${colors.reset}: ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.red}❌ [ERROR]${colors.reset}: ${msg}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.magenta}🐛 [DEBUG]${colors.reset}: ${msg}`, ...args);
    }
  },
  http: (method, url, status, duration) => {
    const statusColor = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.blue}[HTTP]${colors.reset} ${colors.bright}${method}${colors.reset} ${url} ${statusColor}${status}${colors.reset} ${colors.dim}(${duration}ms)${colors.reset}`);
  }
};

export default logger;
