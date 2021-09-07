const Hapi = require('@hapi/hapi');

init = async () => {
  
  const server = Hapi.server({
    port: 3000,
  });
  await server.start();
  console.log(`Server is running on ${server.info.uri}`);

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        return 'Test Path'
      }
    }
  ])
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();