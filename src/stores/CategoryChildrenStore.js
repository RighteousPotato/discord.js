'use strict';

const { ChannelTypes } = require('../util/Constants');
const GuildChannelStore = require('./GuildChannelStore');
const PermissionOverwrites = require('../structures/PermissionOverwrites');

/**
 * Stores guild channels with a common {CategoryChannel} parent.
 * @extends {GuildChannelStore}
 */
class CategoryChildrenStore extends GuildChannelStore {
  constructor(guild, iterable, parent) {
    super(guild, iterable);
    this._parent = parent;
  }

  /**
     * The parent {@link CategoryChannel} of the {@link GuildChannel}s in this store
     * @type {?CategoryChannel}
     * @readonly
     */
  get parent() {
    return this._parent;
  }
  /**
   * Creates a new channel in the parent category.
   * @param {string} name The name of the new channel
   * @param {Object} [options] Options
   * @param {string} [options.type='text'] The type of the new channel, either `text` or `voice`
   * @param {string} [options.topic] The topic for the new channel
   * @param {boolean} [options.nsfw] Whether the new channel is nsfw
   * @param {number} [options.bitrate] Bitrate of the new channel in bits (only voice)
   * @param {number} [options.userLimit] Maximum amount of users allowed in the new channel (only voice)
   * @param {OverwriteResolvable[]|Collection<Snowflake, OverwriteResolvable>} [options.permissionOverwrites]
   * Permission overwrites of the new channel
   * @param {number} [options.position] Position of the new channel
   * @param {number} [options.rateLimitPerUser] The ratelimit per user for the channel
   * @param {string} [options.reason] Reason for creating the channel
   * @returns {Promise<GuildChannel>}
   * @example
   * // Create a new text channel
   * guild.channels.create('new-general', { reason: 'Needed a cool new channel' })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Create a new channel with permission overwrites
   * guild.channels.create('new-voice', {
   *   type: 'voice',
   *   permissionOverwrites: [
   *      {
   *        id: message.author.id,
   *        deny: ['VIEW_CHANNEL'],
   *     },
   *   ],
   * })
   */
  async create(name, options = {}) {
    let {
      type,
      topic,
      nsfw,
      bitrate,
      userLimit,
      permissionOverwrites,
      position,
      rateLimitPerUser,
      reason,
    } = options;
    if (type && !['text', 'voice'].includes(type)) throw new TypeError('Type must be either \'text\' or \'voice\'.');
    parent = this.client.channels.resolveID(this._parent);
    
    if (permissionOverwrites) {
      permissionOverwrites = permissionOverwrites.map(o => PermissionOverwrites.resolve(o, this.guild));
    }

    const data = await this.client.api.guilds(this.guild.id).channels.post({
      data: {
        name,
        topic,
        type: type ? ChannelTypes[type.toUpperCase()] : 'text',
        nsfw,
        bitrate,
        user_limit: userLimit,
        parent_id: parent,
        position,
        permission_overwrites: permissionOverwrites,
        rate_limit_per_user: rateLimitPerUser,
      },
      reason,
    });
    return this.client.actions.ChannelCreate.handle(data).channel;
  }
}

module.exports = GuildChannelStore;
