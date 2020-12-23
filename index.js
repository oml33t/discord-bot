require('dotenv').config();

const Discord = require('discord.js');

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
  }
});

client.login(process.env.DISCORD_TOKEN);