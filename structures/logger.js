const chalk = require('chalk');

module.exports = class Logger {
    static log(content, type = 'log') {
        const watermark = `[${chalk.gray('Matrix')}] ||• `;
        switch (type) {
            case 'log': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.green('[Info]')} ${content} `
                );
            }
            case 'warn': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.yellow('[Warn]')} ${content} `
                );
            }
            case 'error': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.red('[Error]')} ${content} `
                );
            }
            case 'debug': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.magenta('[Debug]')} ${content} `
                );
            }
            case 'event': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.green('[Event]')} ${content} `
                );
            }
            case 'cmd': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.green('[Cmd]')} ${content} `
                );
            }
            case 'ready': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.green('[Ready]')} ${content} `
                );
            }
            case 'shard': {
                return console.log(
                    `${watermark} ${chalk.blue('>>>')} ${chalk.green('[Shard]')} ${content}`
                );
            }
        }
    }

    static error(content) {
        return this.log(content, 'error');
    }

    static warn(content) {
        return this.log(content, 'warn');
    }

    static debug(content) {
        return this.log(content, 'debug');
    }

    static cmd(content) {
        return this.log(content, 'cmd');
    }

    static event(content) {
        return this.log(content, 'event');
    }

    static ready(content) {
        return this.log(content, 'ready');
    }

    static shard(content) {
        return this.log(content, 'shard');
    }
};