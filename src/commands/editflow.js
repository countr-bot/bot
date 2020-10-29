module.exports = {
  description: "Edit a flow.",
  usage: {
    "<flow ID>": "The flow ID of the flow you want to edit. This can be found in the 'listflows'-command."
  },
  examples: {},
  aliases: [ "modifyflow", "=flow" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length == 1,
  allowInCountingChannel: true
};

const { flowWalkthrough, formatExplanation, limitTriggers, limitActions } = require("../constants/index.js"), config = require("../../config.json");

module.exports.run = async (message, [ flowID ], gdb) => {
  const { flows } = gdb.get();
  if (!flows[flowID]) return message.channel.send("❌ This flow does not exist.");

  if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send("❌ The bot is missing the `Manage Channels`-permission. When editing a flow, the bot will create a new channel so you can reconfigure your flow.");

  const
    channel = await message.guild.channels.create("countr-flow-editor", {
      permissionOverwrites: [
        {
          id: message.client.user.id,
          allow: [
            "VIEW_CHANNEL",
            "SEND_MESSAGES",
            "MANAGE_MESSAGES",
            "EMBED_LINKS",
            "READ_MESSAGE_HISTORY"
          ]
        },
        {
          id: message.author.id,
          allow: [
            "VIEW_CHANNEL",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY"
          ]
        },
        {
          id: message.guild.roles.everyone,
          deny: [
            "VIEW_CHANNEL"
          ]
        }
      ]
    }),
    status = await message.channel.send(`🌀 Head over to ${channel} to edit your flow!`),
    newFlow = flows[flowID],
    generateEmbed = async () => ({
      title: `🌀 Editing flow ${flowID}`,
      description: [
        "This is sort of the same as the flow creator. You can use the same commands to configure your flow as you did when creating the flow.",
        `You can have ${limitTriggers == 1 ? "1 trigger" : `${limitTriggers} triggers`} and ${limitActions == 1 ? "1 action" : `${limitActions} actions`} per flow.`
      ].join("\n\n"),
      color: config.color,
      timestamp: Date.now(),
      footer: {
        icon_url: message.author.displayAvatarURL(),
        text: `Serving ${message.author.tag}`
      },
      fields: [
        {
          name: "Flow Commands",
          value: [
            "• `edit <trigger or action> <slot>`: Edit a trigger or action's slot.",
            "• `finish`: Finish the flow and save it.",
            "• `cancel`: Cancel the creation without saving.",
            "**The commands does not require the bot prefix, just simply write it in the channel.** Also notice that normal bot commands have been disabled in this channel."
          ].join("\n")
        },
        {
          name: "Current Flow Actions",
          value: await Promise.all(newFlow.actions.slice(0, limitActions).map(async (action, index) => `${index + 1} - ${action ? `${await formatExplanation(action)}` : "**Empty**"}`)),
          inline: true
        },
        {
          name: "Current Flow Triggers",
          value: await Promise.all(newFlow.triggers.slice(0, limitTriggers).map(async (trigger, index) => `${index + 1} - ${trigger ? `${await formatExplanation(trigger)}` : "**Empty**"}`)),
          inline: true
        }
      ]
    }),
    pinned = await channel.send("Loading ...");

  await pinned.pin();
  const success = await flowWalkthrough(message.guild, message.author, channel, newFlow, generateEmbed, pinned);

  channel.delete();
  gdb.editFlow(flowID, newFlow);
  if (success) status.edit(`✅ Flow \`${flowID}\` has been edited.`);
  else status.edit("✴️ Flow edit has been cancelled.");
  return message;
};