/**
 * @description Contains database utility functions used for set up in the
 * scaffold process
 */
import DIRTDatabaseOpt = DIRTStackCLI.DIRTDatabaseOpt;

function getPort(engine: string): string {
  const opts: { [key: string]: string } = {
    mysql: '3306',
    postgresql: '5432',
    sqlite: '',
  };

  return opts[engine] ?? '';
}

/**
 * @function generateDatabaseSettings
 * @param projectName
 * @param databaseOpt
 * @description Helper function that generates a default database settings object given
 * a database option and project name. By default, the database name will be based
 * on the project name and the database username will be of the format:
 * <projectName>_admin. This forms the basis of your project's database settings
 * but can be changed or replaced as needed.
 */ export function generateDatabaseSettings(
  projectName: string,
  databaseOpt: Omit<'None', DIRTDatabaseOpt>
): string {
  if (databaseOpt === 'sqlite') {
    return `{
    'default': {
        \t'ENGINE': 'django.db.backends.sqlite3',
        \t'NAME': BASE_DIR / "db.sqlite3",
    },
}`;
  }
  return `{
    'default': {
      \t'ENGINE': 'django.db.backends.${databaseOpt}',
      \t'USER': '${projectName}_admin',
      \t'NAME': '${projectName}',
      \t'PASSWORD': 'ch@nge-thi$-password!',
      \t'HOST': 'localhost',
      \t'PORT': '${getPort(databaseOpt as string)}',
    },
}`;
}
