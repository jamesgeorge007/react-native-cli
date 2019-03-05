// @flow
import fs from 'fs-extra';
import path from 'path';
import Ora from 'ora';
import PackageManager from '../util/PackageManager';
import walk from '../util/walk';

async function getExternalTemplate(templateName: string) {
  const packageManager = new PackageManager({});
  await packageManager.install([templateName]);
  await fs.copy(path.join('node_modules', templateName), process.cwd());
}

async function getReactNativeTemplate(version: string) {
  const packageManager = new PackageManager({});
  await packageManager.install([`react-native@${version}`]);

  // We should use `path.dirname(require.resolve('react-native/template'));`, but for now
  // I use this version, because react-native doesn't exist in cli context
  const templatePath = path.join(
    process.cwd(),
    'node_modules',
    'react-native',
    'template'
  );

  await fs.copy(templatePath, process.cwd());
}

function replaceNameInUTF8File(filePath: string, projectName: string) {
  const content = fs
    .readFileSync(filePath, 'utf8')
    .replace(/ProjectName/g, projectName)
    .replace(/projectname/g, projectName.toLowerCase());

  fs.writeFileSync(filePath, content, 'utf8');
}

const BINARY_EXT = ['.png', '.jar'];

function isNonBinaryFile(filePath: string) {
  return (
    !BINARY_EXT.some(ext => filePath.includes(ext)) &&
    !fs.statSync(filePath).isDirectory()
  );
}

function renameFile(filePath: string, oldName: string, newName: string) {
  const newFileName = path.join(
    path.dirname(filePath),
    path.basename(filePath).replace(new RegExp(oldName, 'g'), newName)
  );

  fs.moveSync(filePath, newFileName);
}

function shouldRenameFile(filePath: string, nameToReplace: string) {
  return path.basename(filePath).includes(nameToReplace);
}

function changeNameInTemplate(projectName: string) {
  walk(process.cwd())
    .reverse()
    .forEach((filePath: string) => {
      if (isNonBinaryFile(filePath)) {
        replaceNameInUTF8File(filePath, projectName);
      }
      if (shouldRenameFile(filePath, 'ProjectName')) {
        renameFile(filePath, 'ProjectName', projectName);
      }
      if (shouldRenameFile(filePath, 'projectname')) {
        renameFile(filePath, 'projectname', projectName.toLowerCase());
      }
    });
}

export async function prepareExternalTemplate(
  projectName: string,
  templateName: string
) {
  const loader = new Ora({ text: 'Getting template files' }).start();
  await getExternalTemplate(templateName);
  loader.succeed();
  loader.text = 'Setting up files';
  await changeNameInTemplate(projectName);
  loader.succeed();
}

export async function prepareReactNativeTemplate(
  projectName: string,
  version: string
) {
  const loader = new Ora({ text: 'Getting react-native template' }).start();
  await getReactNativeTemplate(version);
  loader.succeed();
  loader.text = 'Setting up files';
  await changeNameInTemplate(projectName);
  loader.succeed();
}
