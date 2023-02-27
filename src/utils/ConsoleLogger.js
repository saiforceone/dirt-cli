import chalk from 'chalk';

const messageConfigs = (configName) => {
  const configs = {
    error: {
      icon: '❌',
      color: 'red',
    },
    info: {
      icon: 'ℹ️ ',
      color: 'cyan',
    },
    success: {
      icon: '✅',
      color: 'green',
    },
    warning: {
      icon: '⚠️ ',
      color: 'yellow',
    },
  };

  return configs[configName] || configs['info'];
};

/**
 * @class ConsoleLogger
 * @description Utility class for printing out console log messages for the CLI
 */
export default class ConsoleLogger {
  /**
   * @description Prints out a message based on the config key passed in.
   * @param {string} message
   * @param {string} configName
   */
  static printMessage(message, configName = 'info') {
    const logTime = new Date();

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(logTime);
    const config = messageConfigs(configName);
    console.log(
      chalk[config['color']](
        `${config['icon']} [${formattedDate}] » ${message}`
      )
    );
  }

  static printInfoMessage(message, inProgress = false) {
    console.log(`${chalk.blue(message)}`);
  }

  static printSuccessMessage(message) {}
}
