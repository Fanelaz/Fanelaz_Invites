exports.run = async (client, message, args) => {
    const prefix = process.env.prefix
    message.channel.send({embed: {
        description: `\`${prefix}addinvites <member> <number>\` Ajoute un nombre exact d'invitations à un membre\n\`${prefix}help\` Montre le liste des commandes\n\`${prefix}invites <member>\` Indique le nombre d'invitations que vous ou le membre mentionné a\n\`${prefix}resetinvites\` Supprime toutes les invitations de tout le monde\n\`${prefix}uptime\` Vous dit depuis combien de temps le robot est allumé`,
        color: 44678,
    }})
}