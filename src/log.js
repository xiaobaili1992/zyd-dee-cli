import chalk from 'chalk'

const log = console.log;

const logSuccess = (msg) => {
  log(chalk.green(msg))
}

const logBgSuccess = (msg) => {
  log(chalk.bgGreen(msg))
}

const logError = (msg) => {
  log(chalk.red(msg))
}

const logBgError = (msg) => {
  log(chalk.bgRed(msg))
}

const logWarning = (msg) => {
  const warning = chalk.hex('#FFA500');
  log(warning(msg))
}

const logBgWarning = (msg) => {
  const warningBg = chalk.hex('#FFA500');
  log(warningBg(msg))
}

const logInfo = (msg) => {
  log(chalk.blue(msg))
}

const logBgInfo = (msg) => {
  log(chalk.bgBlue(msg))
}

export {
  logSuccess,
  logBgSuccess,
  logError,
  logBgError,
  logWarning,
  logBgWarning,
  logInfo,
  logBgInfo
}