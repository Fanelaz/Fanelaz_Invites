exports.run = async (client, message, args) => {
  const db = require('../db.js');
  let mention =
    (await message.mentions.members.first()) ||
    (await message.guild.members.cache.get(args[0]));
  if(mention) {
    const invites = await db.get(mention.id)
    if(invites) {
      message.channel.send({embed: {
        title: `**${mention.user.username}**`,
        description: `<@${mention.id}> a **${invites}** invites!`,
        footer: {
          text: client.user.username,
          icon_url: client.user.displayAvatarURL()
        },
        color: 44678,
        timestamp: new Date()
      }})
    } else {
      message.channel.send({embed: {
        title: `**${mention.user.username}**`,
        description: `<@${mention.id}> a **0** invites!`,
        footer: {
          text: client.user.username,
          icon_url: client.user.displayAvatarURL()
        },
        color: 44678,
        timestamp: new Date()
      }})
    }
  } else if(args[0]) {
    const name = await message.guild.members.fetch({ query: args[0], limit: 1 })
    if(name.first()) {
      const invites = await db.get(name.first().id)
      if(invites) {
        message.channel.send({embed: {
          title: `**${name.first().user.username}**`,
          description: `<@${name.first().id}> a **${invites}** invites!`,
          footer: {
            text: client.user.username,
            icon_url: client.user.displayAvatarURL()
          },
          color: 44678,
          timestamp: new Date()
        }})
      } else {
        message.channel.send({embed: {
          title: `**${name.first().user.username}**`,
          description: `<@${name.first().id}> a **0** invites!`,
          footer: {
            text: client.user.username,
            icon_url: client.user.displayAvatarURL()
          },
          color: 44678,
          timestamp: new Date()
        }})
      }
    } else {
      message.channel.send({embed: {
        description: `Ce n'est pas un membre !`,
        footer: {
          text: client.user.username,
          icon_url: client.user.displayAvatarURL()
        },
        color: 44678,
        timestamp: new Date()
      }})
    }
  } else {
    const invites = await db.get(message.member.id)
    if(invites) {
      message.channel.send({embed: {
        title: `**${message.author.username}**`,
        description: `<@${message.author.id}> a **${invites}** invites!`,
        footer: {
          text: client.user.username,
          icon_url: client.user.displayAvatarURL()
        },
        color: 44678,
        timestamp: new Date()
      }})
    } else {
      message.channel.send({embed: {
        title: `**${message.author.username}**`,
        description: `<@${message.author.id}> a **0** invites!`,
        footer: {
          text: client.user.username,
          icon_url: client.user.displayAvatarURL()
        },
        color: 44678,
        timestamp: new Date()
      }})
    }
  }
}