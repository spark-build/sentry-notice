import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import { FastifyInstance } from 'fastify';

const readdir = util.promisify(fs.readdir);

export const routePrefix = '/';

export const initRoutes = async (fastify: FastifyInstance) => {
  // TODO: 后续可以用装饰器来收集
  const routeFiles = await readdir(__dirname);

  return Promise.all(
    routeFiles
      .filter((routeFile) => routeFile.indexOf('index') !== 0 && /\.[jt]s$/.test(routeFile))
      .map((routeFile) =>
        import(path.resolve(__dirname, routeFile)).then((result) => result.default(fastify)),
      ),
  );
};
