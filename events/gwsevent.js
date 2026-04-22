const { MessageEmbed, Permissions } = require('discord.js');
const Giveaway = require('../models/Giveaway');

module.exports = async (client) => {
    try {
        const giveaways = await Giveaway.find();
        if (giveaways.length === 0) return;

        for (const giveaway of giveaways) {
            const timeLeft = giveaway.endsAt - Date.now();

            if (timeLeft <= 0) {
                await endGiveaway(client, giveaway);
            } else {
                setTimeout(() => endGiveaway(client, giveaway), timeLeft);
            }
        }
    } catch (error) {
        console.error('<:matrixx_cross:1303862206999298138> | Error fetching giveaways:', error);
    }
};

// Function to handle the giveaway ending
async function endGiveaway(client, giveaway) {
    try {
        const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
        if (!channel) {
            console.log(`<:matrixx_cross:1303862206999298138> | Channel not found: ${giveaway.channelId}`);
            await Giveaway.deleteOne({ messageId: giveaway.messageId });
            return;
        }

        const botMember = await channel.guild.members.fetch(client.user.id);
        if (!botMember.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) {
            console.log(`<:matrixx_cross:1303862206999298138> | Missing Send Messages permission in: ${giveaway.channelId}`);
            await Giveaway.deleteOne({ messageId: giveaway.messageId });
            return;
        }

        const giveawayMessage = await channel.messages.fetch(giveaway.messageId).catch(() => null);
        if (!giveawayMessage) {
            console.log(`<:matrixx_cross:1303862206999298138> | Giveaway message not found: ${giveaway.messageId}`);
            await Giveaway.deleteOne({ messageId: giveaway.messageId });
            return;
        }

        const reaction = giveawayMessage.reactions.cache.get('🎉');
        if (!reaction) {
            console.log(`<:matrixx_cross:1303862206999298138> | 🎉 reaction found on message: ${giveaway.messageId}`);
            await Giveaway.deleteOne({ messageId: giveaway.messageId });
            return;
        }

        const users = await reaction.users.fetch();
        const filteredUsers = users.filter((u) => !u.bot);

        if (filteredUsers.size === 0) {
            await channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription('<:matrixx_cross:1303862206999298138> | No valid participants, giveaway canceled.')
                        .setColor('RED')
                ]
            }).catch(() => console.log(`<:matrixx_cross:1303862206999298138> | Cannot send message in: ${giveaway.channelId}`));

            await Giveaway.deleteOne({ messageId: giveaway.messageId });
            return;
        }

        let winners = new Set();
        while (winners.size < giveaway.winnerCount && winners.size < filteredUsers.size) {
            let randomUser = filteredUsers.random();
            winners.add(randomUser);
        }

        winners = [...winners].map((u) => `<@${u.id}>`).join(', ');

        const winnerEmbed = new MessageEmbed()
            .setTitle('__🎉 **GIVEAWAY ENDED** 🎉__')
            .setDescription(`
            **Prize:** **__${giveaway.prize}__** <a:giftr_gift:1303862171507228714>
            **Winner(s):** ${winners}
            **Hosted by:** <@${giveaway.hostId}>
            `)
            .setColor('DARK_RED')
            .setThumbnail(client.user.displayAvatarURL({ size: 1024 }));

        await channel.send({
            content: `🎉 Congrats ${winners}, you won **${giveaway.prize}**!`,
            embeds: [winnerEmbed]
        }).catch(() => console.log(`<:matrixx_cross:1303862206999298138> | Cannot send winner message in: ${giveaway.channelId}`));

        // Delete the giveaway from the database
        await Giveaway.deleteOne({ messageId: giveaway.messageId });

    } catch (error) {
        console.error(`<:matrixx_cross:1303862206999298138> | Giveaway End Error:`, error);
    }
}
