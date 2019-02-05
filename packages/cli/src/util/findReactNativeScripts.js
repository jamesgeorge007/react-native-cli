/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 */

import path from 'path';
import fs from 'fs';

function findReactNativeScripts(): ?string {
  const executablePath = path.resolve(
    'node_modules',
    '.bin',
    'react-native-scripts'
  );
  if (fs.existsSync(executablePath)) {
    return executablePath;
  }
  return null;
}

module.exports = findReactNativeScripts;
