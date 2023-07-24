/**
 * D.I.R.T Stack CLI type definitions
 */
declare namespace DIRTStackCLI {
  /**
   * Frontend definitions
   */
  export type Frontend = 'react' | 'vue';

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
    installPrettier: boolean;
    deploymentOption: DIRTDeploymentOpts;
    databaseOption: DIRTDatabaseOpt;
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

  export type DIRTDependenciesFile = {
    packages: Record<string, string>;
  };

  export type DIRTCoreOpts = {
    destinationBase: string;
    frontend: Frontend;
  };

  export type DIRTStorybookOpts = DIRTCoreOpts & {
    storySource: string;
    templateSource: string;
  };

  export type DIRTFrontendPathOpts = {
    BASE_HTML_TEMPLATES_PATH: string;
    STATIC_TEMPLATES_PATH: string;
    STORY_BOOK_STORIES_PATH: string;
    STORY_BOOK_TEMPLATES_PATH: string;
    TEMPLATES_PATH: string;
    TYPES_PATH: string;
  };

  export type DIRTDeploymentOpts = 'Vercel' | 'None';

  export type DIRTVercelOpts = {
    projectName: string;
    destination: string;
  };

  export type DIRTVercelBuildOpt = {
    src: string;
    use: string;
    config?: {
      distDir: string;
    };
  };
  export type DIRTVercelRoute = {
    src: string;
    dest: string;
  };

  export type DIRTVercelConfigFile = {
    builds: [DIRTVercelBuildOpt];
    routes: [DIRTVercelRoute];
  };

  export type DIRTDatabaseOpt = 'None' | 'sqlite' | 'mysql' | 'postgresql';

  export type DIRTDatabaseConfig = {
    ENGINE: Omit<'None', DIRTDatabaseOpt>;
    NAME: string;
    USER?: string;
    PASSWORD?: string;
    HOST?: string;
    PORT?: string;
  };

  export type DIRTProjectConfig = {
    projectConfig: ScaffoldOptions & {
      dirtCLIVersion?: string;
    };
  };

  export type DIRTAdvCommand = 'create-controller' | 'gen-secret-key';
}
