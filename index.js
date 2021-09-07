const Hapi = require('@hapi/hapi');

init = async () => {
  
  const server = Hapi.server({
    port: 3000,
  });
  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();