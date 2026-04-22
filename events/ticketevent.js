const { MessageEmbed, MessageActionRow, MessageButton, Permissions, Modal, TextInputComponent } = require('discord.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        const { guild, user, customId, channel } = interaction;

        // Handle the ticket creation button
        if (customId === 'create_ticket') {
            const modal = new Modal()
                .setCustomId('ticket_reason_modal')
                .setTitle('Ticket Creation')
                .addComponents(
                    new MessageActionRow().addComponents(
                        new TextInputComponent()
                            .setCustomId('ticket_reason')
                            .setLabel('What is the reason for this ticket?')
                            .setStyle('PARAGRAPH')
                            .setRequired(true)
                    )
                );

            return await interaction.showModal(modal);
        }

        // Handle ticket reason submission
        if (customId === 'ticket_reason_modal') {
            const reason = interaction.fields.getTextInputValue('ticket_reason');

            let ticketCategory = guild.channels.cache.find(
                (ch) => ch.name === 'Matrix Ticket' && ch.type === 'GUILD_CATEGORY'
            );

            if (!ticketCategory) {
                ticketCategory = await guild.channels.create('Matrix Ticket', {
                    type: 'GUILD_CATEGORY',
                    permissionOverwrites: [{ id: guild.id, deny: [Permissions.FLAGS.VIEW_CHANNEL] }]
                });
            }

            let ticketManagerRole = guild.roles.cache.find(role => role.name === 'Ticket Manager');
            if (!ticketManagerRole) {
                ticketManagerRole = await guild.roles.create({
                    name: 'Ticket Manager',
                    color: 'BLUE',
                    permissions: []
                });
            }

            const existingChannel = guild.channels.cache.find(
                (ch) => ch.name.startsWith(`ticket-`) && ch.parentId === ticketCategory.id && ch.topic === user.id
            );

            if (existingChannel) {
                return interaction.reply({
                    content: `<:matrixx_cross:1303862206999298138> | You already have an open ticket: <#${existingChannel.id}>.`,
                    ephemeral: true
                });
            }

            const ticketNumber = guild.channels.cache.filter(ch => ch.name.startsWith('ticket-')).size + 1;
            const ticketChannel = await guild.channels.create(`ticket-${ticketNumber}`, {
                type: 'GUILD_TEXT',
                parent: ticketCategory.id,
                topic: user.id,
                permissionOverwrites: [
                    { id: guild.id, deny: [Permissions.FLAGS.VIEW_CHANNEL] },
                    { id: user.id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY] },
                    { id: ticketManagerRole.id, allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY] }
                ]
            });

            const ticketEmbed = new MessageEmbed()
                .setTitle(' | Matrix Ticket')
                .setDescription(`Thanks <@${user.id}> For Creating Ticket A staff member will assist you shortly.\n\n **Reason:** __**${reason}**__ \n`)
                .setColor('BLACK')
                .setFooter('Click the button below to close this ticket.', client.user.displayAvatarURL());

            const ticketButtons = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('close_ticket').setLabel('Close Ticket').setStyle('DANGER')
            );

            await ticketChannel.send({
                content: `**Hello <@${user.id}> Please Wait <@&${ticketManagerRole.id}> has been notified...**`,
                embeds: [ticketEmbed],
                components: [ticketButtons]
            });

            await interaction.reply({
                content: `<:matrixx_tick:1303862364956921899> | Your ticket has been created: <#${ticketChannel.id}>.`,
                ephemeral: true
            });
        }

        // Close Ticket
        if (customId === 'close_ticket') {
            if (!channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'This command can only be used inside a ticket channel.', ephemeral: true });
            }

            await interaction.reply({ content: '<a:gears:1311940359974031371> | Closing this ticket in **5 seconds**...', ephemeral: true });

            setTimeout(async () => {
                const ticketEmbed = new MessageEmbed()
                    .setTitle(' | Ticket Closed')
                    .setDescription(`This ticket was closed by <@${user.id}>.`)
                    .setColor('RED')
                    .setTimestamp();

                const ticketButtons = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId(`reopen_ticket`).setLabel('Reopen Ticket').setStyle('SUCCESS'),
                    new MessageButton().setCustomId(`delete_ticket`).setLabel('Delete Permanently').setStyle('DANGER')
                );

                await channel.send({ embeds: [ticketEmbed], components: [ticketButtons] });

                await channel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: false });
                await channel.permissionOverwrites.edit(guild.id, { VIEW_CHANNEL: false });

                const ticketManagerRole = guild.roles.cache.find(role => role.name === 'Ticket Manager');
                if (ticketManagerRole) {
                    await channel.permissionOverwrites.edit(ticketManagerRole.id, { VIEW_CHANNEL: false });
                }

                const ticketNumber = channel.name.match(/\d+/) ? channel.name.match(/\d+/)[0] : 'unknown';
                await channel.setName(`closed-ticket-${ticketNumber}`).catch(console.error);

            }, 5000);
        }

        // Reopen Ticket
        if (customId === 'reopen_ticket') {
            await channel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: true });
            await interaction.reply({ content: '<:matrixx_tick:1303862364956921899> | Ticket reopened!', ephemeral: true });
            await channel.setName(channel.name.replace('closed-ticket', 'ticket')).catch(console.error);
        }

        // Delete Ticket
        if (customId === 'delete_ticket') {
            await interaction.reply({ content: '<a:gears:1311940359974031371> | Deleting ticket in **5 seconds...**', ephemeral: true });
            setTimeout(() => channel.delete(), 3000);
        }
    });

    // Ticket Commands
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const prefix = message.guild.prefix || '';
    let datab = client.noprefix || []
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const { channel, guild } = message;

    if (command === "tadd") {
        if (!channel.name.startsWith('ticket-')) return message.reply("This command can only be used inside a ticket channel.");
    
        const type = args[0];
        if (!type || (type !== "user" && type !== "role")) {
            return message.reply("Usage: `&tadd user @User / UserID` or `&tadd role @Role / RoleID`");
        }
    
        let target = message.mentions.members.first() || message.mentions.roles.first();
        
        if (!target) {
            const targetId = args[1];
            if (!targetId) return message.reply("Please mention a user/role or provide a valid ID.");
    
            try {
                target = (type === "user") 
                    ? await message.guild.members.fetch(targetId)  // Fetch member explicitly
                    : message.guild.roles.cache.get(targetId);
            } catch (error) {
                return message.reply("Invalid user/role ID.");
            }
    
            if (!target) return message.reply("Invalid user/role ID.");
        }
    
        await channel.permissionOverwrites.edit(target.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            READ_MESSAGE_HISTORY: true
        });
    
        return message.reply(`<:matrixx_tick:1303862364956921899> | Added ${target} to the ticket.`);
    }

    if (command === "tremove") {
        if (!channel.name.startsWith('ticket-')) return message.reply("This command can only be used inside a ticket channel.");
    
        const type = args[0];
        if (!type || (type !== "user" && type !== "role")) {
            return message.reply("Usage: `&tremove user @User / UserID` or `&tremove role @Role / RoleID`");
        }
    
        let target = message.mentions.members.first() || message.mentions.roles.first();
        
        if (!target) {
            const targetId = args[1];
            if (!targetId) return message.reply("Please mention a user/role or provide a valid ID.");
    
            try {
                target = (type === "user") 
                    ? await message.guild.members.fetch(targetId)  // Fetch member explicitly
                    : message.guild.roles.cache.get(targetId);
            } catch (error) {
                return message.reply("Invalid user/role ID.");
            }
    
            if (!target) return message.reply("Invalid user/role ID.");
        }
    
        await channel.permissionOverwrites.edit(target.id, {
            VIEW_CHANNEL: false
        });
    
        return message.reply(`<:matrixx_tick:1303862364956921899> | Removed ${target} from the ticket.`);
    }        
    if (command === "tclose") {
        if (!channel.name.startsWith('ticket-')) {
            return message.reply("This command can only be used inside a ticket channel.");
        }
    
        await message.reply("<a:gears:1311940359974031371> | Closing this ticket in **5 seconds**...");
    
        setTimeout(async () => {
            const ticketEmbed = new MessageEmbed()
                .setTitle(' | Ticket Closed')
                .setDescription(`This ticket was closed by <@${message.author.id}>.`)
                .setColor('RED')
                .setTimestamp();
    
            const ticketButtons = new MessageActionRow().addComponents(
                new MessageButton().setCustomId(`reopen_ticket`).setLabel('Reopen Ticket').setStyle('SUCCESS'),
                new MessageButton().setCustomId(`delete_ticket`).setLabel('Delete Permanently').setStyle('DANGER')
            );
    
            await channel.send({ embeds: [ticketEmbed], components: [ticketButtons] });
    
            // Restrict channel access
            await channel.permissionOverwrites.edit(message.author.id, { VIEW_CHANNEL: false });
            await channel.permissionOverwrites.edit(message.guild.id, { VIEW_CHANNEL: false });
    
            // Hide from Ticket Manager Role
            const ticketManagerRole = message.guild.roles.cache.find(role => role.name === 'Ticket Manager');
            if (ticketManagerRole) {
                await channel.permissionOverwrites.edit(ticketManagerRole.id, { VIEW_CHANNEL: false });
            }
    
            // Rename the ticket to indicate closure
            const ticketNumber = channel.name.match(/\d+/) ? channel.name.match(/\d+/)[0] : 'unknown';
            await channel.setName(`closed-ticket-${ticketNumber}`).catch(console.error);
    
        }, 5000);
    }        

});
};
