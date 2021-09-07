const Hapi = require('@hapi/hapi');
const Discord = require('discord.js');

init = async () => {
  
  const server = Hapi.server({
    port: 3000,
  });

  const preResponse = async (request, h) => {
    let response = request.response;
    let err400;
    if ('output' in response && response.output.statusCode === 400 && 'details' in response.output.payload) {
      err400 = response.output.payload.details;
    }

    if (response.isBoom && (request.path !== '/favicon.ico')) {
      responseText = `Error ${response.output.statusCode} - ${response.message}\n*[${request.method.toUpperCase()}]* \`https://${request.headers.host}${request.path}\``;
      let responseTextDiscord = `[**${response.headers.host}]** -> Error ${response.output.statusCode} - ${response.message}\n**[${request.method.toUpperCase()}]** \`${request.path}\``;

      const {pd} = require('@sterlp/pretty-data');
      if (!!err400) responseText += `\n\`\`\`${pd.json(err400)}\`\`\``;
      if (response.output.statusCode !== 400 && response.output.statusCode !== 200 && response.output.statusCode !== 403 && response.output.statusCode !== 404 && response.output.statusCode !== 401) {
        const hook = new Discord.WebhookClient('879297081804750848', 'vmGXFAB4why_BZrzEUOwS6qImo7K8BvYYKFOQ8-cFp1_IvSJ7S0n1JRQARaTndHzpDRV');
        const createWebhookMessageOption = server.app.createWebhookMessageOption;
        const getParamsQueryPayload = server.app.getParamsQueryPayload;
        let paramsQueryPayload = getParamsQueryPayload(request);
        let messageOption = createWebhookMessageOption(hook, paramsQueryPayload, request, h, responseTextDiscord);
        await hook.send(`${(messageOption.alreadySend) ? 'ของอันก่อนหน้า ' : ''}${responseTextDiscord}`, messageOption.embeds);
      }
    }
    return h.continue;
  }

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);

  server.ext('onPreResponse', preResponse);

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