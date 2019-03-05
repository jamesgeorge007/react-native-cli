// @flow
import fs from 'fs-extra';
import type { ContextT } from '../core/types.flow';
import { validateProjectName } from './validate';
import DirectoryAlreadyExistsError from './errors/DirectoryAlreadyExistsError';
import {
  prepareExternalTemplate,
  prepareReactNativeTemplate,
} from './prepareTemplate';
import printRunInstructions from './printRunInstructions';
import logger from '../util/logger';

type Options = {|
  template?: string,
|};

type ExternalTemplateOptions = $Diff<Options, { template: string }> & {
  template: string,
};

function createFromExternalTemplate(
  projectName: string,
  options: ExternalTemplateOptions
) {
  logger.info('Initializing new project from extrenal template');
  return prepareExternalTemplate(projectName, options.template);
}

function createFromReactNativeTemplate(projectName: string, rnVersion: string) {
  logger.info('Initializing new project');
  return prepareReactNativeTemplate(projectName, rnVersion);
}

function createProject(
  projectName: string,
  options: Options,
  rnVersion: string
): Promise<void> {
  fs.mkdirSync(projectName);
  process.chdir(projectName);

  if (options.template) {
    // $FlowFixMe: Flow goes stupid here
    return createFromExternalTemplate(projectName, options);
  }

  return createFromReactNativeTemplate(projectName, rnVersion);
}

export default async function initialize(
  [projectName]: Array<string>,
  context: ContextT,
  options: Options
): Promise<void> {
  try {
    validateProjectName(projectName);

    if (fs.existsSync(projectName)) {
      throw new DirectoryAlreadyExistsError(projectName);
    }

    await createProject(projectName, options, context.rnVersion);

    printRunInstructions(process.cwd(), projectName);
  } catch (e) {
    logger.error(e.message);
    fs.removeSync(projectName);
  }
}
