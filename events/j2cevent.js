const { Client } = require('discord.js');

module.exports = async (client) => {
    let tempChannels = new Map();

    const findJ2CChannels = (guild) => {
        const category = guild.channels.cache.find(c => c.name === 'Matrix Temp Voice' && c.type === 'GUILD_CATEGORY');
        if (!category) return null;

        return {
            categoryId: category.id,
            duoChannel: guild.channels.cache.find(c => c.name === 'Create Duo' && c.parentId === category.id),
            trioChannel: guild.channels.cache.find(c => c.name === 'Create Trio' && c.parentId === category.id),
            squadChannel: guild.channels.cache.find(c => c.name === 'Create Squad' && c.parentId === category.id)
        };
    };

    const getNextVCNumber = (guild, vcType) => {
        const existingVCs = guild.channels.cache
            .filter(c => c.type === 'GUILD_VOICE' && c.name.startsWith(vcType))
            .map(c => parseInt(c.name.split(' ')[1]) || 0)
            .sort((a, b) => a - b);

        if (existingVCs.length === 0) return 1;

        for (let i = 1; i <= existingVCs.length + 1; i++) {
            if (!existingVCs.includes(i)) return i;
        }
        return existingVCs.length + 1;
    };

    client.on('ready', async () => {
        client.guilds.cache.forEach(guild => findJ2CChannels(guild));
    });

    client.on('voiceStateUpdate', async (oldState, newState) => {
        if (!newState.channel) return;
        const guild = newState.guild;
        const member = newState.member;
        const channels = findJ2CChannels(guild);

        if (!channels) return;

        let vcType = '';
        let vcLimit = 0;

        if (newState.channel.id === channels.duoChannel?.id) {
            vcType = 'Duo';
            vcLimit = 2;
        } else if (newState.channel.id === channels.trioChannel?.id) {
            vcType = 'Trio';
            vcLimit = 3;
        } else if (newState.channel.id === channels.squadChannel?.id) {
            vcType = 'Squad';
            vcLimit = 4;
        }

        if (!vcType) return;

        const vcNumber = getNextVCNumber(guild, vcType);
        const tempVC = await guild.channels.create(`${vcType} ${vcNumber}`, {
            type: 'GUILD_VOICE',
            parent: channels.categoryId,
            userLimit: vcLimit,
            permissionOverwrites: [
                {
                    id: member.id, 
                    allow: ['MOVE_MEMBERS', 'CONNECT', 'SPEAK', 'STREAM', 'USE_VAD'],
                },
                {
                    id: guild.roles.everyone, 
                    allow: ['CONNECT', 'SPEAK', 'STREAM', 'USE_VAD'],
                    deny: ['MOVE_MEMBERS'], 
                }
            ]
        });

        tempChannels.set(tempVC.id, tempVC);
        await member.voice.setChannel(tempVC);

        const checkInterval = setInterval(async () => {
            if (tempVC.members.size === 0) {
                clearInterval(checkInterval);
                tempChannels.delete(tempVC.id);
                await tempVC.delete().catch(() => {});
            }
        }, 5000);
    });
};
