const { EmbedBuilder } = require('discord.js')

/**
 * Very simple, public-friendly util class.
 *
 * This is intentionally minimal and does not include
 * any of the advanced helpers from your private code.
 */
class Utils {
  constructor(client) {
    this.client = client
  }

  // --- Generic helpers -------------------------------------------------

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms || 0))
  }

  async handleRateLimit() {
    // In this public version we just log; no special handling
    console.warn('Rate limit hit (public build): consider slowing down commands.')
  }

  // --- Blacklist / security stubs --------------------------------------

  async BlacklistCheck() {
    // Public version does not enforce any blacklist by default
    return false
  }

  blacklist() {
    // No-op placeholder – load blacklist in your private build
    this.client.blacklist = this.client.blacklist || []
  }

  blacklistserver() {
    // No-op placeholder for server blacklist
    this.client.blacklistserver = this.client.blacklistserver || []
  }

  // --- Prefix / noprefix helpers ---------------------------------------

  setPrefix(message) {
    // Simple public implementation: store prefix on guild object or default '&'
    if (!message?.guild) return
    if (!message.guild.prefix) message.guild.prefix = '&'
  }

  noprefix() {
    // Public build does not support no-prefix users by default
    this.client.noprefix = this.client.noprefix || []
  }

  // --- Permission / hierarchy helpers ----------------------------------

  hasHigher() {
    // Always return false in public build – no complex hierarchy checks
    return false
  }

  async isRateLimited(_channelId) {
    // No global rate-limit tracking in this simplified version
    return false
  }

  // Simple AFK manager stub so afk.js can call this without errors
  async manageAfk(_message, _client) {
    // Public build: AFK system is disabled; no-op implementation
    return
  }

  // --- Formatting helpers (very basic) ---------------------------------

  codeText(text) {
    const safe = String(text ?? '')
    return '```\n' + safe + '\n```'
  }

  async haste(text) {
    // Public build returns a placeholder URL
    const safe = String(text ?? '')
    console.log('Haste requested (public build):\n', safe.slice(0, 200))
    return 'https://example.com/PUT_YOUR_HASTE_URL_HERE'
  }

  pagination() {
    // Omitted in public build – implement your own pagination privately
    console.warn('pagination() is not implemented in the public build.')
  }

  // --- Welcomer helpers (simple responses) -----------------------------

  async sendPreview(settings, member) {
    // Minimal preview helper used by some welcomer commands
    try {
      const channel = member?.guild?.channels?.cache.get(settings?.welcome?.channel)
      if (!channel) return 'No welcome channel configured.'

      const embed = new EmbedBuilder()
        .setColor(this.client.color || '#5865F2')
        .setDescription(`Welcome to ${member.guild.name}, ${member.user}!`)

      await channel.send({ embeds: [embed] })
      return 'Sent a basic welcome preview.'
    } catch {
      return 'Failed to send preview.'
    }
  }

  async setStatus() {
    return 'Updated welcome status (public placeholder).'
  }

  async setChannel() {
    return 'Updated welcome channel (public placeholder).'
  }

  async setDescription() {
    return 'Updated welcome description (public placeholder).'
  }

  async setThumbnail() {
    return 'Updated welcome thumbnail (public placeholder).'
  }

  async setTitle() {
    return 'Updated welcome title (public placeholder).'
  }

  // --- Misc small helpers ----------------------------------------------

  formatBytes(bytes = 0) {
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }
}

module.exports = Utils
