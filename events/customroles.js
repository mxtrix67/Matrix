const { MessageEmbed } = require('discord.js');

module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return; // Ignore bot messages

        const prefix = await client.db.get(`prefix_${message.guild.id}`) || '&'; // Get the server prefix
        let content = message.content;
        let args, command;

        // Fetch the no-prefix user list
        let noPrefixUsers = await client.db.get(`noprefix_${client.user.id}`) || [];

        // Check if the message starts with the prefix
        if (content.startsWith(prefix)) {
            args = content.slice(prefix.length).trim().split(/ +/);
            command = args.shift().toLowerCase();
        } else if (noPrefixUsers.includes(message.author.id)) {
            // If the user is in the no-prefix list, process only if it's a valid command
            args = content.trim().split(/ +/);
            command = args.shift().toLowerCase();
        } else {
            return; // Ignore unrelated messages
        }

        // Retrieve the custom role configuration from the database
        const data = await client.db.get(`customrole_${message.guild.id}`);
        if (!data) return;

        const roleIndex = data.names.indexOf(command);
        
        if (roleIndex !== -1) { // Only apply role checks if the command is related to roles
            
            // Check if the user has permission to manage roles
            if (!message.member.permissions.has('ADMINISTRATOR') && !message.member.permissions.has('MANAGE_ROLES')) {
                const embed = new MessageEmbed()
                    .setColor('#2f3136')
                    .setDescription('<:matrixx_cross:1303862206999298138> | You need the **Manage Roles** permission to use this command.');
                return message.channel.send({ embeds: [embed] });
            }

            const roleId = data.roles[roleIndex];
            const role = message.guild.roles.cache.get(roleId);
            if (!role) {
                const embed = new MessageEmbed()
                    .setColor('#2f3136')
                    .setDescription('<:matrixx_cross:1303862206999298138> | The specified role could not be found in this server.');
                return message.channel.send({ embeds: [embed] });
            }

            const member = message.mentions.members.first();
            if (!member) {
                const embed = new MessageEmbed()
                    .setColor('#2f3136')
                    .setDescription('<:matrixx_cross:1303862206999298138> | Please mention a valid user.');
                return message.channel.send({ embeds: [embed] });
            }

            // Check bot's highest role position
            if (message.guild.me.roles.highest.position <= role.position) {
                const embed = new MessageEmbed()
                    .setColor('#2f3136')
                    .setDescription('<:matrixx_cross:1303862206999298138> | I cannot manage this role because it is higher or equal to my highest role.');
                return message.channel.send({ embeds: [embed] });
            }

            // Check if the command user has a high enough role
            if (message.member.roles.highest.position <= role.position) {
                const embed = new MessageEmbed()
                    .setColor('#2f3136')
                    .setDescription('<:matrixx_cross:1303862206999298138> | You cannot manage this role because it is higher or equal to your highest role.');
                return message.channel.send({ embeds: [embed] });
            }

            // Assign or remove the role
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
                const embed = new MessageEmbed()
                    .setColor('#2f3136')
                    .setDescription(`<:matrixx_tick:1303862364956921899> | Removed the role <@&${roleId}> from **${member.user.tag}**.`);
                return message.channel.send({ embeds: [embed] });
            } else {
                await member.roles.add(roleId);
                const embed = new MessageEmbed()
                    .setColor('#2f3136')
                    .setDescription(`<:matrixx_tick:1303862364956921899> | Added the role <@&${roleId}> to **${member.user.tag}**.`);
                return message.channel.send({ embeds: [embed] });
            }
        }
    });
};
