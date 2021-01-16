// 使用 pm2 启动项目
module.exports = {
  apps: [
    {
      name: 'sentry-notice',
      script: './dist/main.js',
      node_args: '-r ./tsconfig-paths-bootstrap.js',
    },
  ],
};
