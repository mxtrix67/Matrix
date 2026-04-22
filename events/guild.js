const { MessageEmbed } = require('discord.js');
const joinChannelId = '1238908429700173897';
const leaveChannelId = '1238908429700173897';

module.exports = async (client) => {
    client.on('guildCreate', async (guild) => {
        try {
            const serverCount = client.guilds.cache.size;
            const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

            let channel;
            try {
                channel = await client.channels.fetch(joinChannelId);
            } catch (error) {
                console.error(`Failed to fetch join channel ${joinChannelId}:`, error.message || error);
                return;
            }

            if (!channel) {
                console.error('Join channel not found.');
                return;
            }

            const owner = await guild.fetchOwner();
            const bannerUrl = guild.bannerURL({ dynamic: true, size: 1024 });
            const emoji = (guild.partnered && guild.verified) ? `<:partner:1181495977413185596><:verified:1181495980525363220>` :
                          (guild.partnered) ? '<:partner:1181495977413185596>' :
                          (guild.verified) ? '<:verified:1181495980525363220>' : `${client.emoji.cross}`;

            const embed = new MessageEmbed()
                .setTitle(guild.name)
                .setDescription(`Id: **${guild.id}**\nName: **${guild.name}**\nDiscord Level: ${emoji}\nMemberCount: \`${guild.memberCount + 1}\`\nCreated At: <t:${Math.round(guild.createdTimestamp / 1000)}> (<t:${Math.round(guild.createdTimestamp / 1000)}:R>)\nJoined At: <t:${Math.round(guild.joinedTimestamp / 1000)}> (<t:${Math.round(guild.joinedTimestamp / 1000)}:R>)`)
                .addField('**Owner**', `Info: **${guild.members.cache.get(owner.id) ? guild.members.cache.get(owner.id).user.tag : 'Unknown user'} (${owner.id})**\nMentions: <@${owner.id}>\nCreated At: <t:${Math.round(owner.user.createdTimestamp / 1000)}> (<t:${Math.round(owner.user.createdTimestamp / 1000)}:R>)`)
                .addField(`**${client.user.username}'s Total Servers**`, `\`\`\`js\n${serverCount}\`\`\``, true)
                .addField(`**${client.user.username}'s Total Users**`, `\`\`\`js\n${userCount}\`\`\``, true)
                .addField('**Shard Id**', `\`\`\`js\n${guild.shardId}\`\`\``, true)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
                .setColor(client.color);

            if (guild.vanityURLCode) {
                embed.setURL(`https://discord.gg/${guild.vanityURLCode}`);
            }
            if (guild.banner) {
                embed.setImage(bannerUrl);
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling guildCreate in guild.js:', error);
        }
    });

    client.on('guildDelete', async (guild) => {
        try {
            const serverCount = client.guilds.cache.size;
            const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

            let channel;
            try {
                channel = await client.channels.fetch(leaveChannelId);
            } catch (error) {
                console.error(`Failed to fetch leave channel ${leaveChannelId}:`, error.message || error);
                return;
            }

            if (!channel) {
                console.error('Leave channel not found.');
                return;
            }

            const bannerUrl = guild.bannerURL({ dynamic: true, size: 1024 });
            const embed = new MessageEmbed()
                .setDescription(`Id: **${guild.id}**\nName: **${guild.name}**\nMemberCount: \`${guild.memberCount + 1}\`\nCreated At: <t:${Math.round(guild.createdTimestamp / 1000)}> (<t:${Math.round(guild.createdTimestamp / 1000)}:R>)\nJoined At: <t:${Math.round(guild.joinedTimestamp / 1000)}> (<t:${Math.round(guild.joinedTimestamp / 1000)}:R>)`)
                .addField(`**${client.user.username}'s Total Servers**`, `\`\`\`js\n${serverCount}\`\`\``, true)
                .addField(`**${client.user.username}'s Total Users**`, `\`\`\`js\n${userCount}\`\`\``, true)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
                .setColor(client.color);

            if (guild.vanityURLCode) {
                embed.setURL(`https://discord.gg/${guild.vanityURLCode}`);
            }
            if (guild.banner) {
                embed.setImage(bannerUrl);
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling guildDelete in guild.js:', error);
        }
    });
};
