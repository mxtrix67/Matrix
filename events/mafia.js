





const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Only process messages in channels that are being monitored
        const logChannelId = await client.db.get(`mafialogs_channel_${message.guild.id}`);
        const isActivated = await client.db.get(`mafialogs_${message.guild.id}`);

        if (message.channel.name === 'mafia' && isActivated) {
            console.log(`Message detected in mafia channel: ${message.content}`);

            const contentWithMentions = message.content.replace(/<@!?(\d+)>/g, (match, userId) => {
                const user = message.guild.members.cache.get(userId);
                return user ? `@${user.user.username}` : match;
            });

            const payload = {
                username: message.author.username,
                avatar: message.author.displayAvatarURL({ dynamic: true }),
                content: contentWithMentions,
                guildId: message.guild.id,
                guildName: message.guild.name,
                channelId: message.channel.id,
                timestamp: message.createdTimestamp
            };

            console.log('Payload to be sent:', payload);

            try {
                const response = await axios.post('https://lovemafia.vercel.app/api/logs', payload);
                console.log('Log sent successfully:', response.data);
            } catch (error) {
                console.error('Error sending log to web server:', error);
            }
        }
    });

    client.on('channelDelete', async (channel) => {
        // Check if the deleted channel was the mafia channel
        const logChannelId = await client.db.get(`mafialogs_channel_${channel.guild.id}`);
        const isActivated = await client.db.get(`mafialogs_${channel.guild.id}`);

        if (channel.name === 'mafia' && isActivated) {
            const logsUrl = `https://lovemafia.vercel.app/logs/${channel.guild.id}/${channel.id}`;

            const logChannel = await client.channels.fetch(logChannelId);

            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor(client.color)
                    .setTitle('Mafia Game Logs')
                    .setDescription(`The mafia game has ended. You can view the logs at the following URL:\n[Logs Here](${logsUrl})`);

                try {
                    await logChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error('Error sending logs URL to log channel:', error);
                }
            }
        }
    });
};