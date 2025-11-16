const djs = require('discord.js');

// Support both discord.js v13 (MessageEmbed/MessageActionRow/MessageButton)
// and v14-style builders when available.
const {
    PermissionsBitField,
    Collection,
    WebhookClient
} = djs;

const EmbedBuilder = djs.EmbedBuilder || djs.MessageEmbed;
const ActionRowBuilder = djs.ActionRowBuilder || djs.MessageActionRow;
const ButtonBuilder = djs.ButtonBuilder || djs.MessageButton;
// In v13 we fall back to the string-based styles expected by MessageButton
const ButtonStyle = djs.ButtonStyle || {
    Link: 'LINK',
    Danger: 'DANGER'
};

module.exports = async (client) => {
    const getIgnoreData = async (guildId) => {
        if (client.ignoreCache.has(guildId)) {
            return client.ignoreCache.get(guildId);
        }
        const data = (await client.db?.get(`ignore_${guildId}`)) ?? { channel: [], role: [] };
        client.ignoreCache.set(guildId, data);
        return data;
    };

    const getCustomData = async (guildId) => {
        if (client.customCommandsCache.has(guildId)) {
            return client.customCommandsCache.get(guildId);
        }
        const data = (await client.db.get(`customrole_${guildId}`));
        client.customCommandsCache.set(guildId, data);
        return data;
    };


    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return;
        if (client.blacklist && client.blacklist.has(message.author.id)) {
            return;
        }

        const ownerIDs = ["1125130243045326949", "888706502632816650"];
        if (message.mentions.users.some(user => ownerIDs.includes(user.id))) {
            message.react('<a:9455yellowcrown:1285994040805822587>').catch(error => console.error("Failed to add reaction:", error));
        }

        try {
            if (client.blacklistserver && client.blacklistserver.has(message.guild.id)) {
                return;
            }

            if (!message.guild.prefix) {
                await client.util.setPrefix(message, client);
            }
            const currentGuildPrefix = message.guild.prefix || '&';

            const [uprem, upremend, sprem, spremend, spremown] = await Promise.all([
                client.db.get(`uprem_${message.author.id}`),
                client.db.get(`upremend_${message.author.id}`),
                client.db.get(`sprem_${message.guild.id}`),
                client.db.get(`spremend_${message.guild.id}`),
                client.db.get(`spremown_${message.guild.id}`)
            ]);

            const premrow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel(`Invite Me`).setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`),
                new ButtonBuilder().setLabel(`Support`).setStyle(ButtonStyle.Link).setURL(`https://discord.gg/sDeXvgHhkQ`)
            );
            const premiumLink = 'https://discord.gg/sDeXvgHhkQ';

            if (upremend && Date.now() >= upremend) {
                let scot = 0;
                const upremserver = (await client.db.get(`upremserver_${message.author.id}`)) || [];

                const deletePromises = [
                    client.db.delete(`upremcount_${message.author.id}`),
                    client.db.delete(`uprem_${message.author.id}`),
                    client.db.delete(`upremend_${message.author.id}`),
                    client.db.delete(`upremserver_${message.author.id}`)
                ];
                upremserver.forEach(serverId => {
                    deletePromises.push(client.db.delete(`sprem_${serverId}`));
                    deletePromises.push(client.db.delete(`spremend_${serverId}`));
                    deletePromises.push(client.db.delete(`spremown_${serverId}`));
                });
                await Promise.all(deletePromises);
                scot = upremserver.length;

                message.author.send({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(
                            `Your Premium Has Expired.\nTotal **\`${scot}\`** Servers [Premium](${premiumLink}) was removed.\nClick [here](${premiumLink}) To Buy [Premium](${premiumLink}).`
                        )
                    ],
                    components: [premrow]
                }).catch(err => console.error(`Failed to send premium expiration message to ${message.author.tag}:`, err));
            }

            if (spremend && Date.now() >= spremend) {
                const us = spremown;
                let scount = 0;

                await Promise.all([
                    client.db.delete(`sprem_${message.guild.id}`),
                    client.db.delete(`spremend_${message.guild.id}`),
                    client.db.delete(`spremown_${message.guild.id}`)
                ]);

                const ownerUpremEnd = await client.db.get(`upremend_${us}`);
                if (us && ownerUpremEnd && Date.now() > ownerUpremEnd) {
                    const upremserver = (await client.db.get(`upremserver_${us}`)) || [];

                    const ownerDeletePromises = [
                        client.db.delete(`upremcount_${us}`),
                        client.db.delete(`uprem_${us}`),
                        client.db.delete(`upremend_${us}`),
                        client.db.delete(`upremserver_${us}`)
                    ];
                    upremserver.forEach(serverId => {
                        ownerDeletePromises.push(client.db.delete(`sprem_${serverId}`));
                        ownerDeletePromises.push(client.db.delete(`spremend_${serverId}`));
                        ownerDeletePromises.push(client.db.delete(`spremown_${serverId}`));
                    });
                    await Promise.all(ownerDeletePromises);
                    scount = upremserver.length;

                    client.users.fetch(us).then(user => {
                        if (user) {
                            user.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(client.color)
                                    .setDescription(
                                        `Your Premium Has Expired.\nTotal **\`${scount}\`** Servers [Premium](${premiumLink}) was removed.\nClick [here](${premiumLink}) To Buy [Premium](${premiumLink}).`
                                    )
                                ],
                                components: [premrow]
                            }).catch(errors => console.error(`Failed to send premium expiration message to owner ${us}:`, errors));
                        }
                    }).catch(() => null);
                }

                message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(
                            `The Premium Of This Server Has Expired.\nClick [here](${premiumLink}) To Buy [Premium](${premiumLink}).`
                        )
                    ],
                    components: [premrow]
                }).catch(err => console.error(`Failed to send server premium expiration message in ${message.guild.name}:`, err));
            }


if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {
const OWNER_ID = '1125130243045326949';
const SUPPORT_SERVER_URL = 'https://discord.gg/sDeXvgHhkQ';
const INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel('Invite Me')
.setStyle(ButtonStyle.Link)
.setURL(INVITE_URL),
new ButtonBuilder()
.setLabel('Support Server')
.setStyle(ButtonStyle.Link)
.setURL(SUPPORT_SERVER_URL)
);

const ownerUser = await client.users.fetch(OWNER_ID).catch(() => null);
const currentGuildPrefix = message.guild.prefix || '&';
const embed = new EmbedBuilder()
.setColor(client.color || '#5865F2')
.setTitle(`**Hello! I'm **${client.user.username}`)
.setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
.setDescription(`Hey ${message.author}, thanks for the mention! Here's some quick info to get you started.`)
.addFields(
    { name: '**Prefix Information**', value: `My Prefix here is \`${currentGuildPrefix}\`. Use it to access all available commands.`, inline: false },
    { name: 'Need Help?', value: `Use \`${currentGuildPrefix}help\` to view the list of available commands.`, inline: false }
)
.setFooter({ text: '© Powered by Matrix Development', iconURL: ownerUser?.displayAvatarURL() || client.user.displayAvatarURL() });

    // --- Send the final reply ---
    return message.channel.send({
        embeds: [embed],
        components: [row]
    });
}

            const prefix = currentGuildPrefix;
            const isNoPrefixUser = client.noprefix instanceof Set && client.noprefix.has(message.author.id);
            const mentionPrefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
            
            const detectedPrefix = [prefix, ...mentionPrefixes].find(p => p && message.content.startsWith(p));

            const isCommandAttempt = detectedPrefix || isNoPrefixUser;
            
            if (!isCommandAttempt) return;
            
            // NEW: Check if the bot is currently rate limited before processing the command.
            if (await client.util.isRateLimited(message.channel.id)) {
                // Optionally, you can notify the user that the bot is busy.
                // This message should be very lightweight.
                const warningMsg = await message.reply(`I'm currently handling a lot of requests. Please try again in a moment.`)
                setTimeout(() => warningMsg.delete().catch(() => {}), 3000);
                return;
            }

            const args = message.content.slice(detectedPrefix ? detectedPrefix.length : 0).trim().split(/ +/);
            const cmd = args.shift()?.toLowerCase();
            const command = client.commands.get(cmd) || client.commands.find((c) => c.aliases?.includes(cmd));

            const ignore = await getIgnoreData(message.guild.id);

            if (command) {
                if (command.premium) {
                    const isBotOwner = client.config.owner.includes(message.author.id);
                    if (!isBotOwner && !uprem && !sprem) {
                        const embed = new EmbedBuilder()
                            .setDescription('You Just Discovered a Premium Command! Join Our Support Server To Buy Premium.')
                            .setColor(client.color);
                        return message.channel.send({
                            embeds: [embed],
                            components: [premrow]
                        });
                    }
                }

                const isChannelIgnored = ignore.channel.includes(message.channel.id);
                const hasIgnoredRole = message.member.roles.cache.some((role) => ignore.role.includes(role.id));

                if (isChannelIgnored && !hasIgnoredRole) {
                    const sentMessage = await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(
                                `Apologies, I can't execute commands in this channel as it's currently on my ignore list. Please consider selecting a different channel or contacting the server administrator for support.`
                            )
                        ]
                    });
                    setTimeout(() => sentMessage.delete().catch(() => {}), 3000);
                    return;
                }

                if (client.config.cooldown && !client.config.owner.includes(message.author.id)) {
                    if (!client.cooldowns.has(command.name)) {
                        client.cooldowns.set(command.name, new Collection());
                    }
                    const now = Date.now();
                    const timestamps = client.cooldowns.get(command.name);
                    const cooldownAmount = (command.cooldown ? command.cooldown : 3) * 1000;
                    const userCooldownKey = message.author.id;
                    const userCountKey = `${message.author.id}_count`;
                    const commandLimit = 2;

                    if (timestamps.has(userCooldownKey)) {
                        const expirationTime = timestamps.get(userCooldownKey) + cooldownAmount;
                        if (now < expirationTime) {
                            let commandCount = timestamps.get(userCountKey) || 0;
                            commandCount++;
                            timestamps.set(userCountKey, commandCount);

                            if (commandCount > commandLimit) {
                                if (!client.blacklist.has(message.author.id)) {
                                    client.blacklist.add(message.author.id);
                                    client.db.set(`blacklist_${message.author.id}`, true).catch(console.error);
                                    console.log(`User ${message.author.tag} (${message.author.id}) blacklisted for spamming.`);

                                    const ricky = new EmbedBuilder()
                                        .setColor(client.color)
                                        .setTitle('Blacklisted for Spamming')
                                        .setDescription(`You have been blacklisted for spamming commands. Please refrain from such behavior.`)
                                        .addFields([{
                                            name: 'Support Server',
                                            value: '[Join our support server](https://discord.gg/sDeXvgHhkQ)',
                                            inline: true
                                        }])
                                        .setTimestamp();
                                    return message.channel.send({
                                        embeds: [ricky]
                                    });
                                }
                                return;
                            }

                            const timeLeft = (expirationTime - now) / 1000;
                            const sentMessage = await message.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(client.color)
                                    .setDescription(
                                        `${client.emoji.cross} | Please wait \`${timeLeft.toFixed(
                                                1
                                            )}\` more second(s) before reusing the \`${
                                                command.name
                                            }\` command.`
                                    )
                                ]
                            });
                            setTimeout(() => sentMessage.delete().catch(() => {}), 3000);
                            return;
                        }
                    }
                    timestamps.set(userCooldownKey, now);
                    timestamps.set(userCountKey, 1);
                    setTimeout(() => {
                        timestamps.delete(userCooldownKey);
                        timestamps.delete(userCountKey);
                    }, cooldownAmount);
                }

                if (typeof command.run === 'function') {
                    await command.run(client, message, args);
                } else {
                    console.error(`Command "${command.name}" does not have a run function.`);
                }

                const weboo = new WebhookClient({
                    url: `https://discord.com/api/webhooks/1366734020418998393/g7mCcYPecncULeHBiPWw7pCO05ae-CYK_kTA0UnveWjxt1-x4MUInXQBr5plcGOeZqRn`
                });
                const commandlog = new EmbedBuilder()
                    .setAuthor({
                        name: message.author.tag, 
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setColor(client.color)
                    .setThumbnail(message.author.displayAvatarURL({
                        dynamic: true
                    }))
                    .setTimestamp()
                    .setDescription(
                        `Command Ran In : \`${message.guild.name} | ${message.guild.id}\`\n Command Ran In Channel : \`${message.channel.name} | ${message.channel.id}\`\n Command Name : \`${command.name}\`\n Command Executor : \`${message.author.tag} | ${message.author.id}\`\n Command Content : \`${message.content}\``
                    );
                weboo.send({
                    embeds: [commandlog]
                }).catch(err => console.error("Failed to send command log webhook:", err));

            } else {
                const customdata = await getCustomData(message.guild.id);

                if (customdata) {
                    for (const [index, data] of customdata.names.entries()) {
                        if (cmd === data) {
                            if (
                                ignore.channel.includes(message.channel.id) &&
                                !message.member.roles.cache.some((role) =>
                                    ignore.role.includes(role.id)
                                )
                            ) {
                                return message.channel
                                    .send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(
                                                `Apologies, I can't execute commands in this channel as it's currently on my ignore list. Please consider selecting a different channel or contacting the server administrator for support..`
                                            )
                                        ]
                                    })
                                    .then((x) => {
                                        setTimeout(() => x.delete().catch(() => {}), 3000);
                                    });
                            }

                            let role = await message.guild.roles.fetch(customdata.roles[index]).catch(() => null);

                            if (!customdata.reqrole) {
                                return message.channel.send({
                                    content: `**Attention:** Before using custom commands, please set up the required role.`,
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(client.color)
                                        .setTitle('Required Role Setup')
                                        .setDescription(
                                            `To enable custom commands, you need to set up a specific role that users must have to access these commands.\nUse the command to set the required role: \n\`${currentGuildPrefix}setup reqrole @YourRequiredRole/id\``
                                        )
                                        .setTimestamp()
                                    ]
                                });
                            }
                            if (!message.guild.roles.cache.has(customdata.reqrole)) {
                                const customDataDb = (await client.db?.get(`customrole_${message.guild.id}`)) || {
                                    names: [],
                                    roles: [],
                                    reqrole: null
                                };
                                customDataDb.reqrole = null;
                                client.db?.set(`customrole_${message.guild.id}`, customDataDb).catch(console.error);
                                return message.channel.send({
                                    content: `**Warning:** The required role may have been deleted from the server. I am clearing the associated data from the database.`,
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(client.color)
                                        .setTitle('Database Update')
                                        .setDescription(
                                            `This action is taken to maintain consistency. Please ensure that server roles are managed appropriately.`
                                        )
                                        .setFooter({ text: 'If you encounter issues, contact a server administrator.' })
                                    ]
                                });
                            }
                            if (!message.member.roles.cache.has(customdata.reqrole)) {
                                return message.channel.send({
                                    content: `**Access Denied!**`,
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(client.color)
                                        .setTitle('Permission Error')
                                        .setDescription(
                                            `You do not have the required role to use custom commands.`
                                        )
                                        .addFields({
                                            name: 'Required Role:',
                                            value: `<@&${customdata.reqrole}>`,
                                            inline: false
                                        })
                                        .setFooter({ text: 'Please contact a server administrator for assistance.' })
                                    ]
                                });
                            }
                            if (!role) {
                                const roleIndex = customdata.names.indexOf(data);
                                if (roleIndex > -1) {
                                    customdata.names.splice(roleIndex, 1);
                                    customdata.roles.splice(roleIndex, 1);
                                    client.db?.set(`customrole_${message.guild.id}`, customdata).catch(console.error);
                                }
                                return message.channel.send({
                                    content: `**Warning:** The specified role was not found, possibly deleted. I am removing associated data from the database.`,
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(client.color)
                                        .setTitle('Database Cleanup')
                                        .setDescription(
                                            `To maintain accurate records, the associated data is being removed. Ensure roles are managed properly to prevent future issues.`
                                        )
                                        .setFooter({ text: 'Contact a server administrator if you encounter any problems.' })
                                    ]
                                });
                            } else if (
                                (role && role.permissions.has(PermissionsBitField.Flags.KickMembers)) ||
                                role.permissions.has(PermissionsBitField.Flags.BanMembers) ||
                                role.permissions.has(PermissionsBitField.Flags.Administrator) ||
                                role.permissions.has(PermissionsBitField.Flags.ManageChannels) ||
                                role.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
                                role.permissions.has(PermissionsBitField.Flags.MentionEveryone) ||
                                role.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
                                role.permissions.has(PermissionsBitField.Flags.ManageWebhooks) ||
                                role.permissions.has(PermissionsBitField.Flags.ManageEvents) ||
                                role.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
                                role.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)
                            ) {
                                let permArray = [
                                    'KICK_MEMBERS', 
                                    'BAN_MEMBERS',
                                    'ADMINISTRATOR',
                                    'MANAGE_CHANNELS',
                                    'MANAGE_GUILD',
                                    'MENTION_EVERYONE',
                                    'MANAGE_ROLES',
                                    'MANAGE_WEBHOOKS',
                                    'MANAGE_EVENTS',
                                    'MODERATE_MEMBERS',
                                    'MANAGE_EMOJIS_AND_STICKERS'
                                ];

                                const removePermissionsButton = new ButtonBuilder()
                                    .setLabel('Remove Permissions')
                                    .setStyle(ButtonStyle.Danger)
                                    .setCustomId('remove_permissions');

                                const row = new ActionRowBuilder().addComponents(removePermissionsButton);
                                const initialMessage = await message.channel.send({
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${client.emoji.cross} | **Permission Denied**\nI cannot add <@&${role.id}> to anyone because it possesses the following restricted permissions:\n${PermissionsBitField.resolve(role.permissions.bitfield)
                                                .filter((perm) => {
                                                    const permName = Object.keys(PermissionsBitField.Flags).find(key => PermissionsBitField.Flags[key] === perm);
                                                    return permArray.includes(permName);
                                                })
                                                .map((perm) => {
                                                    const permName = Object.keys(PermissionsBitField.Flags).find(key => PermissionsBitField.Flags[key] === perm);
                                                    return `• \`${permName}\``;
                                                })
                                                .join('\n')}\nPlease review and adjust the role permissions accordingly.`
                                        )
                                    ],
                                    components: [row]
                                });

                                const filter = (interaction) => interaction.customId === 'remove_permissions' && interaction.user.id === message.author.id;
                                const collector = initialMessage.createMessageComponentCollector({
                                    filter,
                                    time: 15000
                                });

                                collector.on('collect', async (interaction) => {
                                    if (!role.editable) {
                                        return interaction.reply({
                                            embeds: [
                                                new EmbedBuilder()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `${client.emoji.cross} | I don't have sufficient permissions to clear permissions from the role. Please make sure my role position is higher than the role you're trying to modify.`
                                                )
                                            ],
                                            ephemeral: true
                                        });
                                    }
                                    role.setPermissions(0n, `Action Done By ${interaction.user.username}: Removed dangerous permissions from role.`).catch(console.error);
                                    interaction.reply({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.tick} | Permissions removed successfully.`)
                                        ],
                                        ephemeral: true
                                    }).catch(console.error);
                                });

                                collector.on('end', () => {
                                    removePermissionsButton.setDisabled(true);
                                    initialMessage.edit({
                                        components: [new ActionRowBuilder().addComponents(removePermissionsButton)]
                                    }).catch(() => {});
                                });
                            } else {
                                // ############ START: UPDATED TARGET SELECTION LOGIC ############
                                // This logic requires a user to be mentioned.
                                
                                // First, check if a user was mentioned in the arguments. If not, send an error message.
                                if (args.length === 0) {
                                    return message.channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(`Please mention a user to give the role. Example: \`${prefix}${cmd} @user\``)
                                        ]
                                    });
                                }

                                // If arguments exist, find the member that was mentioned or specified by ID.
                                const mentionedMember = message.mentions.members.first();
                                const memberById = message.guild.members.cache.get(args[0]);
                                let targetMember = null;

                                if (mentionedMember && (args[0] === `<@!${mentionedMember.id}>` || args[0] === `<@${mentionedMember.id}>`)) {
                                    targetMember = mentionedMember;
                                } else if (memberById) {
                                    targetMember = memberById;
                                }

                                // If a user was specified in the arguments but could not be found, send an error.
                                if (!targetMember) {
                                    return message.channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setTitle('Member Not Found')
                                            .setDescription(`Could not find the specified member. Please provide a valid mention or user ID.`)
                                        ]
                                    });
                                }
                                // ############ END: UPDATED TARGET SELECTION LOGIC ############

                                const invokerHighestRolePos = message.member.roles.highest.position;
                                const botMember = message.guild.members.me || message.guild.me;
                                const botHighestRolePos = botMember ? botMember.roles.highest.position : 0;
                                const roleToAssignPos = role.position;

                                if (
                                    !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles) &&
                                    targetMember.id !== message.author.id
                                ) {
                                    return message.channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.cross} | You don't have permission to assign roles to others.`)
                                        ]
                                    });
                                }

                                if (
                                    targetMember.id !== message.author.id &&
                                    (invokerHighestRolePos < targetMember.roles.highest.position ||
                                        invokerHighestRolePos < roleToAssignPos)
                                ) {
                                    return message.channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.cross} | You cannot assign this role to ${targetMember} because your highest role is not above their highest role or the role you are trying to assign.`)
                                        ]
                                    });
                                }

                                if (
                                    botHighestRolePos <= roleToAssignPos ||
                                    (targetMember && botHighestRolePos <= targetMember.roles.highest.position && targetMember.id !== client.user.id)
                                ) {
                                    return message.channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.cross} | I cannot assign or remove this role because my highest role is not above the role you are trying to assign/remove, or above the target member's highest role.`)
                                        ]
                                    });
                                }

                                if (targetMember.roles.cache.has(role.id)) {
                                    await targetMember.roles.remove(role.id, `${message.author.tag} | ${message.author.id}`);
                                    return message.channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.tick} | The role ${role} has been successfully removed from ${targetMember}`)
                                        ]
                                    });
                                } else {
                                    await targetMember.roles.add(role.id, `${message.author.tag} | ${message.author.id}`);
                                    return message.channel.send({
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.tick} | The role ${role} has been successfully added to ${targetMember}`)
                                        ]
                                    });
                                }
                            }
                            return;
                        }
                    }
                }
                return;
            }

        } catch (err) {
            // UPDATED: Check for Discord API errors specifically
            if (err.code === 429) { // 429 is the 'Too Many Requests' error code
                client.util.handleRateLimit(err); // Pass the error object which may contain helpful info
            } else {
                console.error("Error in messageCreate:", err);
            }
        }
    });
};