import chalk from 'chalk';

const messageConfigs = (configName) => {
  const configs = {
    error: {
      icon: '[ohno]',
      color: 'red',
    },
    info: {
      icon: '[info]',
      color: 'cyan',
    },
    success: {
      icon: '[yass]',
      color: 'green',
    },
    warning: {
      icon: '[warn]',
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
    const config = messageConfigs(configName);
    console.log(
      chalk[config['color']](
        `${chalk.bold.bgBlack(config['icon'])} » ${message}`
      )
    );
  }

  /**
   * @description Prints out a message from the standard output object
   * @param output
   */
  static printOutput(output) {
    this.printMessage(output.result, output.success ? 'success' : 'error');
  }
}
