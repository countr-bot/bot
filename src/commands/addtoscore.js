module.exports = {
  description: "Set a member's score",
  usage: {
    "<member(s ...)>": "The member(s) you want to set the score of",
    "<number>": "The number you want to add to the scores"
  },
  examples: {
    "110090225929191424 9999999": "Will set member with ID 110090225929191424's score to 9999999.",
    "@Promise#0001 @CountingGods 1337": "Will set Promise#0001's and all members in role Counting Gods' score to 1337."
  },
  aliases: [ "+score" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => args.length >= 2,
  allowInCountingChannel: true
};

const { getMember } = require("../constants/index.js");

module.exports.run = async (message, args, gdb) => {
  const addition = parseInt(args.pop());
  if (!addition) return message.channel.send("❌ Invalid number.");

  let members = [];
  for (const arg of args) members.push(await getMember(arg, message.guild));
  members = members.filter(m => m);
  if (!members.length) return message.channel.send("❌ No members were found with your search.");

  const { users } = gdb.get();
  for (const member of members) {
    if (!users[member.id]) users[member.id] = addition;
    else users[member.id] += addition;
  }
  gdb.set("users", users);

  if (members.length == 1) return message.channel.send(`✅ Score of user \`${members[0].user.tag}\` has been changed.`);
  else return message.channel.send(`✅ Scores of ${members.map(m => `\`${m.user.tag}\``).join(", ")} (${members.length} total) has been changed.`);
};