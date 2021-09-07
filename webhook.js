const Discord = require('discord.js');
exports.plugins = {
  name: "webhook",
  once: true,
  register: (server, options) => {
    const getHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    server.app.createWebhookMessageOption = (hook, paramsQueryPayload, request, h, responseTextDiscord) => {
      let alreadySend = false;
      const color = getHexColor();
      const addErrorEmbed = (title, dataObject, returnAsFile = true) => {
        let embed = (returnAsFile) ? returnEmbeds[0] : new Discord.MessageEmbed().setTitle(title).setColor(color);
        if (returnAsFile) {
          dataObject = JSON.stringify(dataObject, null, 2);

        } else {
          let rawData = [];
          let fieldCount = 1;
          let allFieldCount = 1;
          let fieldContentCount = 0;
          for ( let [key, value] of Object.entries(dataObject)) {
            let newFieldData = `${key}: ${value}`;
            newFieldDataLength = newFieldData.length;

            if (fieldCount = 6) {
              rawData = rawData.join('\n');
              
              hook.send(`${(alreadySend) ? 'ของอันก่อนหน้า ' : ''}${responseTextDiscord}`, embed);

              embed = new Discord.MessageEmbed().setTitle(title).setColor(color);
              returnEmbeds = [];
              alreadySend = true;
              rawData = [];
              fieldCount = 1;
              fieldContentCount = 0;
            }

            if (Big(fieldContentCount).plus(newFieldDataLength).plus(2).toNumber() >= 1024) {
              embed.addField(allFieldCount, rawData.join('\n'));
              rawData = [];
              fieldCount++;
              allFieldCount++;
              fieldContentCount = 0;
            }

            fieldContentCount = Big(fieldContentCount).plus(newFieldDataLength).plus(2).toNumber();
            rawData.push(newFieldData);
          }

          rawData = rawData.join(`\n`);
          embed.addFields({ name: allFieldCount, value: rawData })
      
          returnEmbeds.push(embed);
        }
      }

      let returnEmbeds = [];
      const mainEmbeds = new Discord.MessageEmbed().setTitle('Environment').setColor(color);
      let fields = [{ name: 'Server', value: request.headers.host}];

      if (Object.keys(paramsQueryPayload.JWT).length > 0) {
        fields.push({ name: 'ID', value: paramsQueryPayload.JWT.id, inline: true});
        fields.push({ name: 'Token', value: request.auth.token, inline: false});
        fields.push({ name: 'Sign Date', value: new Date(request.auth.credentials.iat * 1000), inline: true });
        fields.push({ name: 'Expire Date', value: new Date(request.auth.credentials.exp * 1000), inline: true });
      }

      mainEmbeds.addFields(fields);
      returnEmbeds.push(mainEmbeds);

      if (Object.keys(paramsQueryPayload.query).length > 0) addErrorEmbed('QUERY', paramsQueryPayload.query);
      if (Object.keys(paramsQueryPayload.payload).length > 0) addErrorEmbed('PAYLOAD', paramsQueryPayload.payload);

      return {
        alreadySend: alreadySend,
        embeds: returnEmbeds
      };

    }

    server.app.getParamsQueryPayload = (request) => {
      const passUnacceptableValue = (postValueObject) => {
        if (!postValueObject) return {};

        let newPostValueObject = {};
        for (const [key, value] of Object.entries(postValueObject)) {
          let passValueTo = value;

          if (Array.isArray(value)) {
            for (let i = 0; i< value.length; i++) {
              if (!value[i]) continue;
              if (value[i] instanceof Buffer) {
                passValueTo = 'array of file as Buffer';
                break;
              }
              if (value[i].readable) {
                passValueTo = 'array of file as stream';
                break;
              }
            }
          } 
          else if (typeof value === 'object' && value !== null) {
            if (value instanceof Buffer) passValueTo = 'file as Buffer';
            if (value.readable) passValueTo = 'file as stream';
          }

          newPostValueObject[key] = passValueTo;
        }

        return newPostValueObject;
      
      };

      return {
        JWT: passUnacceptableValue((!!request.auth) ? (!!request.auth.credentials) ? request.auth.credentials : {} : {}),
        params: passUnacceptableValue(request.params),
        query: passUnacceptableValue(request.query),
        payload: passUnacceptable(request.payload)
      };
    };
  }
}