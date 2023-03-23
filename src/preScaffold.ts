import chalk from 'chalk';
import gradient from 'gradient-string';

const asciiDirt = `
______ ___________ _____   _____  _     _____ 
|  _  \\_   _| ___ \\_   _| /  __ \\| |   |_   _|
| | | | | | | |_/ / | |   | /  \\/| |     | |  
| | | | | | |    /  | |   | |    | |     | |  
| |/ / _| |_| |\\ \\  | |   | \\__/\\| |_____| |_ 
|___/  \\___/\\_| \\_| \\_/    \\____/\\_____/\\___/ 
`;

/**
 * @description Prints out a dirt stack welcome message
 */
export function preScaffold() {
  console.log(`
 ${gradient.pastel(asciiDirt)}
 ${chalk.green("Let's get F.L.I.R.T-y...")}\n
 Before we can scaffold your project, we have a few questions
`);
}
