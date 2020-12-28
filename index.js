require('dotenv').config();

const Discord = require('discord.js');
const axios = require('axios').default;
const jsonfile = require('jsonfile')

const client = new Discord.Client();
const prefix = '!';

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'role' || command === 'r') {
    message.delete();
    const validRoles = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const role = args[0];

    if (validRoles.find((r) => r === role)) {
      const currRoles = message.member.roles.cache.filter((r) => validRoles.find((rr) => rr === r.name)).array();
      for (let i = 0; i < currRoles.length; i++) {
        const currRole = currRoles[i];
        await message.member.roles.remove(currRole);
      }
      const roleObj = message.guild.roles.cache.find((r) => r.name === role);
      await message.member.roles.add(roleObj)
      message.reply(`role ${role} assigned to you`).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    } else {
      message.reply('you stupid buffoon that role does not exist for you!').then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 10000);
      });
    }
  } else if (command === 'tldrrefresh') {
    const tldrEndpoint = axios.create({
      baseURL: `https://tldr-pages.github.io/assets/`,
      timeout: 60000,
    });

    const { data } = await tldrEndpoint.get(null);

    jsonfile.writeFileSync('tldr.json', data, { spaces: 2 });
    message.reply('tldr updated!');
  } else if (command === 'tldr') {

    const tldrEndpoint = axios.create({
      baseURL: `https://raw.githubusercontent.com/tldr-pages/tldr/master/pages/`,
      timeout: 60000,
    });

    const cmd = args[0];
    const platform = args[1] || 'common';
    data = jsonfile.readFileSync('tldr.json');

    let found = false;
    for (let i = 0; i < data.commands.length; i++) {
      const c = data.commands[i];
      if (c.name === cmd) {
        found = true;
        const oses = [platform, "common", "linux", "windows", "osx", "sunos"];
        for (let j = 0; j < oses.length; j++) {
          const o = oses[j];
          try {
            let { data } = await tldrEndpoint.get(`${o}/${cmd}.md`);
            // data = data.replace(/(\r\n|\r|\n)+/g, '$1');
            const lines = data.split('\n');
            const title = lines[0].substring(2,);
            const tldrEmbed = new Discord.MessageEmbed()
              .setColor('#AD1457')
              .setTitle(`${title} [${o}]`)
              .setURL(`https://github.com/tldr-pages/tldr/tree/master/pages/${o}/${cmd}.md`)
              .setDescription(lines.slice(1).join('\n').trim())
              .setFooter('https://tldr.sh/')
              .setTimestamp();

            message.channel.send(tldrEmbed);
          } catch (error) {
            // console.log(error);
          }
          break;
        }
      }
    }
    if (!found) {
      message.reply('the database does not include this command! Send `!tldrrefresh` to refresh the cache.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);