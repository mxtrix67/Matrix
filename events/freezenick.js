const { MessageEmbed } = require('discord.js');

module.exports = async (client) => {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const { user, nickname } = newMember;

        // Check if the user has a frozen nickname
        const frozenNicknames = await client.data.get(`frozenNicknames_${newMember.guild.id}`) || {};
        if (frozenNicknames[user.id]) {
            const { frozenNick, oldNick } = frozenNicknames[user.id];

            // Revert nickname change
            if (nickname !== frozenNick) {
                try {
                    await newMember.setNickname(frozenNick);
                } catch (error) {
                    console.error("Failed to revert nickname change:", error);
                }
            }
        }
    });

    client.on('guildMemberRemove', async (member) => {
        const { user } = member;

        // Remove frozen nickname entry when the user leaves the guild
        const frozenNicknames = await client.data.get(`frozenNicknames_${member.guild.id}`) || {};
        if (frozenNicknames[user.id]) {
            delete frozenNicknames[user.id];
            await client.data.set(`frozenNicknames_${member.guild.id}`, frozenNicknames);
        }
    });

    client.on('guildMemberAdd', async (member) => {
        const { user } = member;

        // Reapply frozen nickname when the user rejoins the guild
        const frozenNicknames = await client.data.get(`frozenNicknames_${member.guild.id}`) || {};
        if (frozenNicknames[user.id]) {
            const { frozenNick } = frozenNicknames[user.id];
            try {
                await member.setNickname(frozenNick);
            } catch (error) {
                console.error("Failed to reapply frozen nickname:", error);
            }
        }
    });
};