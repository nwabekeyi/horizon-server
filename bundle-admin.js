import { bundle } from '@adminjs/bundler';
import path from 'path';

const run = async () => {
  await bundle({
    customComponentsInitializationFilePath: path.resolve('.adminjs/entry.js'),
    destinationDir: path.resolve('.adminjs'),
  });

  console.log('✅ AdminJS bundle successfully created at .adminjs/bundle.js');
};

run();
