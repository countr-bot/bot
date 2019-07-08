module.exports.run = async (client, message, args, db, permissionLevel, strings, config) => {
    if (args.length == 0) return message.channel.send("📋 " + strings["DOCUMENTATION"] + ": https://countr.xyz/\n📎 " + strings["SUPPORT_SERVER"] + ": https://countr.page.link/support");

    let command = args[0].toLowerCase()
    let commandDesc = strings["COMMAND_" + command.toUpperCase()]

    if (commandDesc) return message.channel.send("🔅 **\`" + await db.getPrefix(message.guild.id) + command + (Object.keys(commandDesc.usage).join(" ") ? " " + Object.keys(commandDesc.usage).join(" ") : "") + "\`: " + commandDesc.description + "**" + (formatUsage(commandDesc.usage, await db.getPrefix(message.guild.id)) ? "\n\n**" + strings["ARGUMENTS"] + ":**\n" + formatUsage(commandDesc.usage, await db.getPrefix(message.guild.id)) : "") + (formatExamples(commandDesc.examples, command, await db.getPrefix(message.guild.id)) ? "\n\n**" + strings["EXAMPLES"] + ":**\n" + formatExamples(commandDesc.examples, command, await db.getPrefix(message.guild.id)) : ""))
    
    return message.channel.send("⚠ " + strings["COMMAND_DOES_NOT_EXIST"] + " " + strings["FOR_HELP"].replace("{{HELP}}", "\`" + await db.getPrefix(message.guild.id) + "help help\`"));
}

// 0 All, 1 Mods, 2 Admins, 3 Global Admins, 4 First Global Admin
module.exports.permissionRequired = 0
module.exports.argsRequired = 0

function format(str, prefix) {
    while (str.includes("{{PREFIX}}")) str = str.replace("{{PREFIX}}", prefix)
    return str;
}

function formatUsage(args, prefix) {
    let list = [];
    for (var arg in args) list.push("- \`" + arg + "\`: " + format(args[arg], prefix));
    return list.join("\n");
}

function formatExamples(examples, command, prefix) {
    let list = [];
    for (var ex in examples) list.push("- \`" + prefix + command + (ex !== "-" ? " " + ex : "") + "\`: " + format(examples[ex], prefix));
    return list.join("\n");
}