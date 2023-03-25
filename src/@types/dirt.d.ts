/**
 * D.I.R.T Stack CLI type definitions
 */
declare namespace DIRTStackCLI {
  /**
   * Frontend definitions
   */
  export type Frontend = 'react' | 'vue' | 'svelte';

  export type LogType = 'noisyLogs' | 'quietLogs';

  export type ConfigType = 'error' | 'info' | 'success' | 'warning';

  export type ScaffoldOutput = {
    error?: string;
    result: string;
    success: boolean;
  };

  export type ScaffoldOptions = {
    frontend: Frontend;
    initializeGit: boolean;
    projectName: string;
    verboseLogs: boolean;
    withStorybook: boolean;
  };

  export type MessageConfigOption = {
    icon: string;
    color: string;
  };

  export type MessageConfiguration = Record<ConfigType, MessageConfigOption>;

  export type DIRTPkgFile = {
    name: string;
    scripts: Record<string, string>;
  };
}
