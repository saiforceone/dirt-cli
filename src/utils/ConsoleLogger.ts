import chalk, { ForegroundColorName } from 'chalk';
import ConfigType = DIRTStackCLI.ConfigType;
import MessageConfiguration = DIRTStackCLI.MessageConfiguration;
import MessageConfigOption = DIRTStackCLI.MessageConfigOption;
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

/**
 * @description Object literal for message configuration options
 * @param {ConfigType} configName
 */
const messageConfigs = (configName: ConfigType): MessageConfigOption => {
  const configs: MessageConfiguration = {
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
  static printMessage(message: string, configName: ConfigType = 'info') {
    const config = messageConfigs(configName);
    const colorName = config.color as ForegroundColorName;
    console.log(
      chalk[colorName](`${chalk.bold.bgBlack(config['icon'])} » ${message}`)
    );
  }

  /**
   * @description Prints out a message from the standard output object
   * @param output
   */
  static printOutput(output: ScaffoldOutput) {
    this.printMessage(output.result, output.success ? 'success' : 'error');
  }
}
