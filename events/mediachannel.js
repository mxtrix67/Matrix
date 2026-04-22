const { MessageEmbed } = require('discord.js');

module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        try {
            
            if (message.author.bot) return;

      
            await client.util.BlacklistCheck(message.guild.id);


            const mediaConfig = await client.db.get(`mediachannel_${message.guild.id}`) ?? null;
            if (!mediaConfig || !mediaConfig.channel) return;

            const channelID = mediaConfig.channel;

       
            if (message.channel.id === channelID && !message.attachments.size) {
                await message.delete();

   
                const errorMessage = new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(
                        `This channel is configured as a media-only channel. You are not allowed to send messages here without attachments.`
                    );
                const sentMessage = await message.channel.send({ embeds: [errorMessage] });

           
                setTimeout(() => sentMessage.delete().catch(console.error), 3000);
            }
        } catch (error) {
            console.error('Error handling messageCreate event:', error);
        }
    });
};
