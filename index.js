const express = require('express');
const app = express();

app.get('/', (request, response) => {
     response.sendStatus(200);
});

let listener = app.listen(process.env.PORT, () => {
     console.log('Your app is currently listening on port: ' + listener.address().port);
});

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const figlet = require('figlet');
const guildInvites = new Map();
require('dotenv').config();
const fs = require('fs');

let commandlist = [];

fs.readdir('./commands/', async (err, files) => {
    if(err){
        return console.log(chalk.red('An error occured when checking the commands folder for commands to load: ' + err));
    }
    files.forEach(async (file) => {
        if(!file.endsWith('.js')) return;
        let commandFile = require(`./commands/${file}`);
        commandlist.push({
            file: commandFile,
            name: file.split('.')[0]
        });
    });
});

client.on('ready', async () => {
  console.log(chalk.yellow(figlet.textSync('Invite Manager', { horizontalLayout: 'full' })));
  console.log(chalk.red(`Bot started!\n---\n`
  + `> Users: ${client.users.cache.size}\n`
  + `> Channels: ${client.channels.cache.size}\n`
  + `> Servers: ${client.guilds.cache.size}`));
  client.guilds.cache.forEach(guild => {
    guild.fetchInvites()
    .then(invites => guildInvites.set(guild.id, invites))
    .catch(err => console.log(err));
    });
    let botstatus = fs.readFileSync('./bot-status.json');
    botstatus = JSON.parse(botstatus);
    if(botstatus.enabled.toLowerCase() == 'false') return;
    if(botstatus.activity_type.toUpperCase() == 'STREAMING') {
      client.user.setPresence({ activity: { name: botstatus.activity_text, type: botstatus.activity_type.toUpperCase()}, status: botstatus.status.toLowerCase() }).catch(console.error);
    } else {
      client.user.setPresence({ activity: { name: botstatus.activity_text, type: botstatus.activity_type.toUpperCase()}, status: botstatus.status.toLowerCase() }).catch(console.error);
    }
});

client.on('inviteCreate', async invite => {
  guildInvites.set(invite.guild.id, await invite.guild.fetchInvites())
})

client.on('guildMemberAdd', async member => {
  if(process.env.welcomeChannel != "false") {
    const welcomeChannel = client.channels.fetch(process.env.welcomeChannel)

    const tembedliens = new Discord.MessageEmbed()
    .setTitle(`<a:tada:791677505420787752> Bienvenu(e) sur ${member.guild.name}`)
    .setDescription('<a:diament:791691271080509490>' + member.toString() +'a utilisé le lien personnalisé du serveur et nous sommes' + member.guild.memberCount +'<a:diament:791691271080509490>')
    .setColor('GREEN')

    if(member.user.bot) return welcomeChannel.send(tembedliens)
  }
  const db = require('./db.js')
  const cachedInvites = guildInvites.get(member.guild.id);
  const newInvites = await member.guild.fetchInvites();
  guildInvites.set(member.guild.id, newInvites);
  try {
    const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code).uses < inv.uses);
    const currentInvites = await db.get(`${usedInvite.inviter.id}`)
    if(currentInvites) {
      const newamount = currentInvites-0 + 1-0
      const welcomeChannel = await client.channels.fetch(process.env.welcomeChannel)

      const tembedinvit = new Discord.MessageEmbed()
      .setTitle(`<a:tada:791677505420787752> Bienvenu(e) sur ${member.guild.name}`)
      .setDescription( member.toString() +' a rejoin ! <a:rond:790916940302254080>\n \n➜ Inviter par :' + usedInvite.inviter.toString() + '\n➜ Nombre d\'Invitations :' + newamount + '\n \n \n <a:diament:791691271080509490> Nous sommes ' + member.guild.memberCount +  ' <a:diament:791691271080509490>')
      .setColor('GREEN')


      if(welcomeChannel) {
        welcomeChannel.send(tembedinvit).catch(err => console.log(err));
      }
      db.set(`${member.id}`, `${usedInvite.inviter.id}`)
      db.set(`${usedInvite.inviter.id}`, `${newamount}`)
    } else {
      const welcomeChannel = await client.channels.fetch(process.env.welcomeChannel)
      db.set(`${usedInvite.inviter.id}`, `1`)
      db.set(`${member.id}`, `${usedInvite.inviter.id}`)

      if(welcomeChannel) {

        const tembedinvit = new Discord.MessageEmbed()
        .setTitle(`<a:tada:791677505420787752> Bienvenu(e) sur ${member.guild.name}`)
        .setDescription( member.toString() +' a rejoin ! <a:rond:790916940302254080>\n \n➜ Inviter par :' + usedInvite.inviter.toString() + '\n➜ Nombre d\'Invitations : **' + newamount + '**\n \n \n <a:diament:791691271080509490> Nous sommes `' + member.guild.memberCount +  '` <a:diament:791691271080509490>')
        .setColor('GREEN')
  
        welcomeChannel.send(tembedinvit).catch(err => console.log(err));
      }
    }
  }
  catch(err) {
    console.log(err);
  }
});
client.on('guildMemberRemove', async member => {

  const db = require('./db.js')

  const inviter = await db.get(`${member.id}`)
  const userinviter = await member.guild.members.fetch(`${inviter}`);
  const currentInvites = await db.get(`${inviter}`)
  try {
    const newamount = currentInvites-0 - 1-0
    db.set(`${inviter}`, `${newamount}`)
    db.delete(`${member.id}`)
  }
  catch(err) {
    console.log(err);
  }
});

client.on('message', async (message) => {
    if(message.author.bot) return;
    if(!message.content.startsWith(process.env.prefix)) return;
    const args = message.content.slice(process.env.prefix.length).split(' ');
    const commandName = args[0].toLowerCase();
    args.shift();
    const command = commandlist.findIndex((cmd) => cmd.name === commandName);
    if(command == -1) return;
    commandlist[command].file.run(client, message, args);
});

client.login(process.env.token);