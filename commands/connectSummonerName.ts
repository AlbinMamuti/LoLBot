import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { getPlayer, getRanked } from "../riotApi/router";
import summonerNameSchema from "../models/usernames"
import subscription from "../models/subscription";
export default {

    category: 'League of Legends User',
    description: 'Insert your Summoner Name so that I can help you git gud',

    expectedArgs: '<server> <summonerName>',
    minArgs: 2,
    slash: 'both',
    callback: async ({ interaction, message, args, user, guild }) => {
        const msg = interaction ? interaction : message;
        if (!guild) return '404 Error'
        const guildId = guild?.id;
        const summonerName = (args.slice(1)).join(' ');
        await summonerNameSchema
            .findByIdAndUpdate({
                _id: user.id
            }, {
                _id: user.id,
                _idDiscord: user.id,
                _summonerName: summonerName,
                _server: 'euw'
            }, {
                upsert: true,
            })
        msg.reply(`Your Summoner Name has been updated to ${summonerName}`)
        await subscription
            .findByIdAndUpdate({
                _id: user.id,
                _guild: guildId,
            }, {
                _id: user.id,
                _idDiscord: user.id,
                _subscription: true,
                _guildId: guild.id,
            }, {
                upsert: true,
            })
    }


} as ICommand