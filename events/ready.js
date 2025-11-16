module.exports = async (client) => {
    client.on('ready', async () => {
        const statuses = [
            { name: `&help | @matrix`, type: `WATCHING` },
            { name: `Protecting Servers`, type: `PLAYING` },
            { name: `.gg/neptune99`, type: `LISTENING` },
            { name: `Matrix Devlopment`, type: `LISTENING` },
            { name: `@Matrix for Info`, type: `LISTENING` }
        ];
        
        let index = 0;

        setInterval(() => {
            // Rotate through the statuses array
            const status = statuses[index];
            client.user.setPresence({
                activities: [status],
                status: `dnd`
            });
            index = (index + 1) % statuses.length; // Loop back to the start
        }, 10000); // Change status every 10 seconds (adjust as needed)

        client.logger.log(`Logged in to ${client.user.tag}`, 'ready');
    });
};
