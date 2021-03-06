import fastify from 'fastify';

import config from './config';
import { initRoutes, routePrefix } from './routes';

const server = fastify({
  logger: true,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
server.register(require('fastify-rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
});

/*
+-----------------------------------------------------------------------------------------------------------------------
| 注册路由
+-----------------------------------------------------------------------------------------------------------------------
*/
server.register(initRoutes as any, { prefix: routePrefix });

server.listen(config.port, (err, address) => {
  if (err) {
    console.log(err);
    server.log.error(err?.message);
    process.exit(1);
  }

  server.log.info(`启动成功: ${address}`);
});
